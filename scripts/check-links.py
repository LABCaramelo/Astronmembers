import re
from pathlib import Path

ROOT = Path(".")
html_files = list(ROOT.glob("*.html")) + list(ROOT.glob("recursos/*.html"))
print(f"Checking {len(html_files)} HTML files for internal links...")

broken = []
total_links = 0
for hf in html_files:
    content = hf.read_text(encoding="utf-8", errors="ignore")
    # match href="/something..."
    links = re.findall(r'href=["\'](/[^"\'#\s]+)["\']', content)
    for l in links:
        total_links += 1
        target = l.lstrip("/")
        if target == "" or target.endswith("/"):
            target_path = ROOT / target / "index.html"
        else:
            target_path = ROOT / target
        if not target_path.exists():
            broken.append((str(hf), l, str(target_path)))

print(f"Total internal links tested: {total_links}")
if broken:
    print(f"Found {len(broken)} broken internal links:")
    for b in broken:
        print(f"  {b[0]} -> {b[1]} (expected: {b[2]})")
else:
    print("SUCCESS: All internal links exist on disk!")
