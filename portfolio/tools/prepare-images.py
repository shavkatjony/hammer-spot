"""
Copy the project screenshots and charts used in the PDFs into assets/img, sized for print.

Every image is a real project output: a screenshot of the deployed app or a chart committed in the
project's repository (sources below). Run again after a project's figures change.

Usage:  REPOS=/path/to/cloned/repos python3 portfolio/tools/prepare-images.py
        (REPOS holds F1-pace-intelligence, telco-churn-prediction, ... ; default: ../shavkatjony next to the site repo)
Needs:  pip install pillow
"""
import os
import pathlib
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent.parent
SITE = HERE.parent
REPOS = pathlib.Path(os.environ.get('REPOS', SITE.parent / 'shavkatjony'))
OUT = HERE / 'assets' / 'img'

# output name: (source, max width in px, format[, crop box in source pixels])
IMAGES = {
    'f1-public-record.jpg': (REPOS / 'F1-pace-intelligence/docs/images/public-record.png', 2400, 'JPEG', (0, 0, 3000, 1000)),
    'f1-pitwall.jpg': (REPOS / 'F1-pace-intelligence/docs/images/pit-wall-hero.png', 2000, 'JPEG'),
    'f1-race-pace.jpg': (REPOS / 'F1-pace-intelligence/docs/images/race-pace-forecast.png', 1600, 'JPEG'),
    'f1-race-engineer.jpg': (REPOS / 'F1-pace-intelligence/docs/images/race-engineer.png', 2400, 'JPEG'),
    'f1-debrief.jpg': (REPOS / 'F1-pace-intelligence/docs/images/debrief.png', 1468, 'JPEG'),
    'f1-practice-vs-race.png': (REPOS / 'F1-pace-intelligence/docs/images/practice-vs-race.png', 1117, 'PNG'),
    'f1-telemetry.png': (REPOS / 'F1-pace-intelligence/docs/images/bahrain-pole.png', 1209, 'PNG'),
    'telco-form.jpg': (REPOS / 'telco-churn-prediction/reports/figures/predictor_main.jpg', 1240, 'JPEG'),
    'telco-result.jpg': (REPOS / 'telco-churn-prediction/reports/figures/predictor_out.jpg', 1023, 'JPEG'),
    'retail-tower.jpg': (REPOS / 'retail-commercial-intelligence/docs/img/executive_preview.png', 1430, 'JPEG'),
    'olist-dashboard.jpg': (REPOS / 'brazilian-e-market/docs/preview.png', 2400, 'JPEG'),
    'olist-cohorts.png': (REPOS / 'brazilian-e-market/reports/figures/cohort_retention.png', 2000, 'PNG'),
    'olist-states.png': (REPOS / 'brazilian-e-market/reports/figures/slowest_states.png', 2000, 'PNG'),
    'scanner-scan.jpg': (SITE / 'public/images/scanner-scan.webp', 1600, 'JPEG'),
    'scanner-match.jpg': (SITE / 'public/images/scanner-match.webp', 1200, 'JPEG'),
    'seam.jpg': (SITE / 'public/images/seam-comparison.webp', 1400, 'JPEG'),
    'portrait.jpg': (SITE / 'src/assets/portrait.jpg', 900, 'JPEG'),
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (src, max_w, fmt, *crop) in IMAGES.items():
        im = Image.open(src)
        im = im.convert('RGB')
        if crop:
            im = im.crop(crop[0])
        if im.width > max_w:
            im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
        dst = OUT / name
        if fmt == 'JPEG':
            im.save(dst, 'JPEG', quality=88, optimize=True, progressive=True)
        else:
            im.save(dst, 'PNG', optimize=True)
        print(f'{name:24} {im.width}x{im.height}  {dst.stat().st_size // 1024} KB  <- {src.relative_to(src.parents[2]) if len(src.parents) > 2 else src}')


if __name__ == '__main__':
    main()
