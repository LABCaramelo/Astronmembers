"""Prepare the captured public presentation pages for the local recreation.

Sources live in reference/resources; runtime UI scripts were captured with REA.
This is an offline, repeatable build: it does not fetch or execute remote code.
"""
from __future__ import annotations

import hashlib
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "reference" / "resources"
ORIGIN = "https://www.astronmembers.com.br"
ASSET_PREFIXES = ("/images/", "/videos/", "/favicon/", "/fonts/")
TRACKER_HOSTS = ("googletagmanager.com", "google-analytics.com", "facebook.com",
                 "facebook.net", "cloudflareinsights.com", "client.crisp.chat",
                 "bzrcdn.openai.com")
TRACKER_CODE = re.compile(r"\b(?:gtag|fbq|oaiq|dataLayer|CRISP_WEBSITE_ID)\b|\$crisp")
LOCAL_SCRIPTS = {
    "/js/main.js": "/js/resource-main.js",
    "/js/i18n.js": "/js/i18n.js",
    "/translations/novosite.js": "/js/translations.js",
}
inventory = json.loads((SOURCE / "inventory.json").read_text(encoding="utf-8-sig"))
pages = inventory["pages"]
routes: dict[str, str] = {"/": "/", "/index.html": "/"}
for page in pages:
    route = page["localRoute"]
    routes[route] = route
    if route.endswith(".html"):
        routes[route[:-5]] = route
    elif route.endswith("/"):
        routes[route[:-1]] = route
        routes[route + "index.html"] = route


def tracker_url(value: str) -> bool:
    host = urlsplit(value).hostname or ""
    return any(host == x or host.endswith("." + x) for x in TRACKER_HOSTS)


def rewrite_url(value: str, base: str, *, navigation: bool = False) -> str:
    if not value or value.startswith(("data:", "mailto:", "tel:", "javascript:")):
        return value
    if value.startswith("#"):
        return value
    absolute = urljoin(base, html.unescape(value))
    parts = urlsplit(absolute)
    if parts.hostname not in ("www.astronmembers.com.br", "astronmembers.com.br"):
        return value
    if parts.path == "/css/novosite.css":
        return "/css/resources.css"
    if parts.path in LOCAL_SCRIPTS:
        return LOCAL_SCRIPTS[parts.path]
    if navigation and parts.path in routes:
        return urlunsplit(("", "", routes[parts.path], parts.query, parts.fragment))
    if any(parts.path.startswith(prefix) for prefix in ASSET_PREFIXES):
        return parts.path
    return absolute


def rewrite_css(text: str, base: str) -> str:
    def replace(match: re.Match) -> str:
        value = match.group(2).strip()
        if value.startswith(("data:", "#")):
            return match.group(0)
        absolute = urljoin(base, value)
        parts = urlsplit(absolute)
        if parts.hostname in ("www.astronmembers.com.br", "astronmembers.com.br") and any(parts.path.startswith(prefix) for prefix in ASSET_PREFIXES):
            return 'url("' + parts.path + '")'
        return 'url("' + absolute.replace('"', "%22") + '")'
    return re.sub(r"url\(\s*(['\"]?)(.*?)\1\s*\)", replace, text, flags=re.S)


class LocalPage(HTMLParser):
    def __init__(self, base: str):
        super().__init__(convert_charrefs=False)
        self.base = base
        self.output: list[str] = []
        self.pending_script: tuple[list[tuple[str, str | None]], list[str]] | None = None
        self.script_removed = 0
        self.ui_scripts = 0
        self.inline_style = False
        self.navigation: list[str] = []

    def tag(self, tag: str, attrs: list[tuple[str, str | None]], closed=False):
        pairs = []
        for key, value in attrs:
            if value is None:
                pairs.append(key)
                continue
            if key in ("href", "src", "poster", "action"):
                value = rewrite_url(value, self.base, navigation=key == "href")
                if key == "href" and value.startswith("/"):
                    self.navigation.append(value)
            elif key == "srcset":
                value = ", ".join(rewrite_url(m[0], self.base) + (" " + m[1] if len(m) > 1 else "")
                                  for m in (item.strip().split(maxsplit=1) for item in value.split(",")))
            elif key == "style":
                value = rewrite_css(value, self.base)
            pairs.append(key + '="' + html.escape(value, quote=True) + '"')
        self.output.append("<" + tag + (" " + " ".join(pairs) if pairs else "") + (" />" if closed else ">"))

    def handle_starttag(self, tag, attrs):
        if tag == "script":
            self.pending_script = (attrs, [])
            return
        values = dict(attrs)
        if tag == "img" and tracker_url(urljoin(self.base, values.get("src") or "")):
            return
        if tag == "style":
            self.inline_style = True
        self.tag(tag, attrs)

    def handle_startendtag(self, tag, attrs):
        if tag == "img" and tracker_url(urljoin(self.base, dict(attrs).get("src") or "")):
            return
        self.tag(tag, attrs, True)

    def handle_endtag(self, tag):
        if tag == "script" and self.pending_script:
            attrs, chunks = self.pending_script
            values = dict(attrs)
            code = "".join(chunks)
            src = values.get("src")
            supported = not src or urlsplit(urljoin(self.base, src)).path in LOCAL_SCRIPTS
            if supported and not TRACKER_CODE.search(code) and not (src and tracker_url(urljoin(self.base, src))):
                self.tag("script", attrs)
                self.output.append(code)
                self.output.append("</script>")
                if code.strip() and values.get("type") != "application/ld+json":
                    self.ui_scripts += 1
            else:
                self.script_removed += 1
            self.pending_script = None
            return
        if tag == "style":
            self.inline_style = False
        if tag == "head":
            self.output.append('\n<link rel="stylesheet" href="/css/resource-overrides.css">\n')
        self.output.append("</" + tag + ">")

    def handle_data(self, data):
        if self.pending_script:
            self.pending_script[1].append(data)
        else:
            self.output.append(rewrite_css(data, self.base) if self.inline_style else data)

    def handle_entityref(self, name):
        self.handle_data("&" + name + ";")

    def handle_charref(self, name):
        self.handle_data("&#" + name + ";")

    def handle_decl(self, decl):
        self.output.append("<!" + decl + ">")

    def handle_comment(self, data):
        if not re.search(r"pixel|analytics|crisp|gtag|oaiq", data, re.I):
            self.output.append("<!--" + data + "-->")


def main():
    original_css = (ROOT / "reference" / "original.css").read_text(encoding="utf-8-sig")
    (ROOT / "css" / "resources.css").write_text(rewrite_css(original_css, ORIGIN + "/css/novosite.css"), encoding="utf-8")
    manifest = []
    for page in pages:
        if page.get("error") or page["status"] != 200:
            raise RuntimeError("Source unavailable: " + page["path"])
        source = ROOT / page["file"]
        local_route = page["localRoute"]
        destination = ROOT / (local_route.lstrip("/") + ("index.html" if local_route.endswith("/") else ""))
        if not destination.resolve().is_relative_to(ROOT):
            raise ValueError("Output outside workspace")
        parser = LocalPage(page.get("finalUrl") or page["url"])
        parser.feed(source.read_text(encoding="utf-8-sig"))
        parser.close()
        result = "".join(parser.output)
        result = re.sub(r'\s*<a\s+[^>]*href=["\']https://central\.astronmembers\.com\.br/entrar[^"\']*["\'][^>]*class=["\']btn\s+btn--ghost[^"\']*["\'][^>]*>.*?</a>', '', result, flags=re.I)
        result = re.sub(r'\s*<a\s+[^>]*class=["\']btn\s+btn--ghost[^"\']*["\'][^>]*href=["\']https://central\.astronmembers\.com\.br/entrar[^"\']*["\'][^>]*>.*?</a>', '', result, flags=re.I)
        result = re.sub(r'\s*<li><a\s+[^>]*href=["\']https://central\.astronmembers\.com\.br/entrar[^"\']*["\'][^>]*>.*?</a></li>', '', result, flags=re.I)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(result, encoding="utf-8")
        manifest.append({"route": local_route, "source": page.get("finalUrl") or page["url"],
                         "title": page["title"], "removed_scripts": parser.script_removed,
                         "inline_ui_scripts": parser.ui_scripts, "local_links": sorted(set(parser.navigation)),
                         "sha256": hashlib.sha256(result.encode()).hexdigest()})
    target = ROOT / "reference" / "resource-build.json"
    target.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"pages": len(manifest), "inline_ui_scripts": sum(x["inline_ui_scripts"] for x in manifest),
                      "manifest": str(target)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
