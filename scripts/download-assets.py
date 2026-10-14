"""Download all external Astron Members assets locally for self-contained / offline use."""
import html
import re
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]

def get_asset_urls():
    urls = set()
    for p in ROOT.rglob("*"):
        if p.suffix in (".html", ".css", ".js") and not any(x in p.parts for x in ("reference", ".rea-browser", ".git")):
            text = p.read_text(encoding="utf-8", errors="ignore")
            clean_text = html.unescape(text)
            matches = re.findall(r"https://www\.astronmembers\.com\.br/(?:images|favicon|fonts|videos)/[^\s\"\'\)\>]+", clean_text)
            for m in matches:
                clean = m.rstrip(".,;\"')?")
                urls.add(clean)
    return sorted(urls)

def download_assets():
    urls = get_asset_urls()
    print(f"Found {len(urls)} assets to download...")
    success = 0
    failed = []
    total_bytes = 0

    for idx, u in enumerate(urls, 1):
        parsed = urlparse(u)
        rel_path = parsed.path.lstrip("/")
        dest = ROOT / rel_path
        dest.parent.mkdir(parents=True, exist_ok=True)
        
        if dest.exists() and dest.stat().st_size > 0:
            success += 1
            total_bytes += dest.stat().st_size
            continue

        try:
            req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = resp.read()
                dest.write_bytes(data)
                total_bytes += len(data)
                success += 1
                if idx % 10 == 0 or idx == len(urls):
                    print(f"[{idx}/{len(urls)}] Downloaded {rel_path} ({len(data)} bytes)")
        except Exception as e:
            print(f"FAILED [{idx}/{len(urls)}] {u}: {e}")
            failed.append((u, str(e)))

    print(f"\nDownload summary: {success}/{len(urls)} assets saved ({total_bytes / (1024*1024):.2f} MB total).")
    if failed:
        print(f"Failed assets ({len(failed)}):")
        for u, err in failed:
            print(f"  {u}: {err}")
    return success, failed

if __name__ == "__main__":
    download_assets()
