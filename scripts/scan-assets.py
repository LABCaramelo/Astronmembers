import re
import html
from pathlib import Path
from urllib.parse import urlparse
from collections import Counter

ROOT = Path(".")
urls = set()
for p in ROOT.rglob("*"):
    if p.suffix in (".html", ".css", ".js") and not any(x in p.parts for x in ("reference", ".rea-browser", ".git")):
        text = p.read_text(encoding="utf-8", errors="ignore")
        # Unescape HTML entities first
        clean_text = html.unescape(text)
        matches = re.findall(r"https://www\.astronmembers\.com\.br/(?:images|favicon|fonts|videos)/[^\s\"\'\)\>]+", clean_text)
        for m in matches:
            clean = m.rstrip(".,;\"')?")
            urls.add(clean)

exts = Counter(Path(urlparse(u).path).suffix.lower() for u in urls)
prefixes = Counter(urlparse(u).path.split("/")[1] for u in urls)

print(f"Total clean assets: {len(urls)}")
print(f"By extension: {dict(exts)}")
print(f"By prefix: {dict(prefixes)}")

# Print all
for u in sorted(urls):
    print(u)
