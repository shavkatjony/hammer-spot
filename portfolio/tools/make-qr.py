"""
QR codes for the printed portfolio (scan to open the website). Usage: python3 portfolio/tools/make-qr.py
Needs: pip install segno
"""
import pathlib
import segno

OUT = pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'qr'
CODES = {
    'site-en.svg': 'https://portfolio.yuldashevv.workers.dev/',
    'site-ko.svg': 'https://portfolio.yuldashevv.workers.dev/ko/',
}

OUT.mkdir(parents=True, exist_ok=True)
for name, link in CODES.items():
    qr = segno.make(link, error='m')
    qr.save(OUT / name, kind='svg', scale=4, border=0, dark='#3d2614', light=None, xmldecl=False, svgns=True, nl=False)
    print('wrote', name, '->', link, f'(version {qr.version})')
