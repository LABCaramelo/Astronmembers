import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PAGES = [ROOT / "planos.html"] + list((ROOT / "recursos").glob("*.html"))

patterns = [
    # Desktop navbar login button
    (re.compile(r'\s*<a\s+[^>]*href=["\']https://central\.astronmembers\.com\.br/entrar[^"\']*["\'][^>]*class=["\']btn\s+btn--ghost["\'][^>]*>.*?</a>', re.I | re.S), ''),
    (re.compile(r'\s*<a\s+[^>]*class=["\']btn\s+btn--ghost["\'][^>]*href=["\']https://central\.astronmembers\.com\.br/entrar[^"\']*["\'][^>]*>.*?</a>', re.I | re.S), ''),
    
    # Mobile menu block button
    (re.compile(r'\s*<a\s+[^>]*href=["\']https://central\.astronmembers\.com\.br/entrar[^"\']*["\'][^>]*class=["\']btn\s+btn--ghost\s+btn--block["\'][^>]*>.*?</a>', re.I | re.S), ''),
    (re.compile(r'\s*<a\s+[^>]*class=["\']btn\s+btn--ghost\s+btn--block["\'][^>]*href=["\']https://central\.astronmembers\.com\.br/entrar[^"\']*["\'][^>]*>.*?</a>', re.I | re.S), ''),

    # Footer link
    (re.compile(r'\s*<li><a\s+[^>]*href=["\']https://central\.astronmembers\.com\.br/entrar[^"\']*["\'][^>]*>.*?</a></li>', re.I | re.S), '')
]

count_modified = 0
for page in PAGES:
    content = page.read_text(encoding="utf-8")
    original = content
    for pattern, repl in patterns:
        content = pattern.sub(repl, content)
    if content != original:
        page.write_text(content, encoding="utf-8")
        count_modified += 1
        print(f"Removed login from: {page.relative_to(ROOT)}")

print(f"Total pages updated: {count_modified}/{len(PAGES)}")
