"""
Make static (single-weight) Newsreader fonts for the PDFs.

Chromium embeds a *variable* font in a PDF as Type 3 glyphs; static instances embed as normal
TrueType fonts, which every PDF viewer and printer renders cleanly. Newsreader is OFL-licensed
(assets/fonts/OFL-Newsreader.txt), so the instances can be stored with the source.

Usage:  python3 portfolio/tools/make-fonts.py
Needs:  pip install fonttools brotli   (downloads the variable fonts from google/fonts once)
"""
import pathlib
import urllib.request
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = pathlib.Path(__file__).resolve().parent.parent
OUT = HERE / 'assets' / 'fonts'
CACHE = HERE / 'build' / 'font-src'
SRC = {
    'roman': 'https://raw.githubusercontent.com/google/fonts/main/ofl/newsreader/Newsreader%5Bopsz,wght%5D.ttf',
    'italic': 'https://raw.githubusercontent.com/google/fonts/main/ofl/newsreader/Newsreader-Italic%5Bopsz,wght%5D.ttf',
    'license': 'https://raw.githubusercontent.com/google/fonts/main/ofl/newsreader/OFL.txt',
}
# family name, style, source, axis location
INSTANCES = [
    ('PF Newsreader Display', 'Regular', 'roman', {'wght': 400, 'opsz': 72}),
    ('PF Newsreader Display', 'Medium', 'roman', {'wght': 520, 'opsz': 72}),
    ('PF Newsreader Display', 'Italic', 'italic', {'wght': 400, 'opsz': 72}),
    ('PF Newsreader Text', 'Regular', 'roman', {'wght': 400, 'opsz': 16}),
    ('PF Newsreader Text', 'Italic', 'italic', {'wght': 400, 'opsz': 16}),
]


def fetch(key: str) -> pathlib.Path:
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / SRC[key].rsplit('/', 1)[-1].replace('%5B', '[').replace('%5D', ']')
    if not path.exists():
        urllib.request.urlretrieve(SRC[key], path)
    return path


def rename(font: TTFont, family: str, style: str) -> None:
    full = f'{family} {style}'
    ps = f"{family.replace(' ', '')}-{style}"
    for rec in font['name'].names:
        if rec.nameID in (1, 16):
            rec.string = family
        elif rec.nameID in (2, 17):
            rec.string = style
        elif rec.nameID == 4:
            rec.string = full
        elif rec.nameID == 6:
            rec.string = ps


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'OFL-Newsreader.txt').write_bytes(fetch('license').read_bytes())
    for family, style, src, loc in INSTANCES:
        font = TTFont(fetch(src))
        static = instancer.instantiateVariableFont(font, loc, updateFontNames=False)
        rename(static, family, style)
        name = f"{family.replace(' ', '')}-{style}.ttf"
        static.save(OUT / name)
        print('wrote', name, loc)


if __name__ == '__main__':
    main()
