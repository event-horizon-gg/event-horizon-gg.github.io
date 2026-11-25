"""Assemble only the pages selected for this release into the generated _site folder."""
import argparse
from pathlib import Path
import re
import shutil

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--scope', choices=('landing', 'full'), required=True)
args = parser.parse_args()
source, output = root / 'dist', root / '_site'
if output.exists():
    shutil.rmtree(output)
output.mkdir()
if args.scope == 'full':
    shutil.copytree(source, output, dirs_exist_ok=True)
else:
    # Allowlist: legal/support routes never enter the landing-only artifact.
    for name in ('index.html', 'base.css', 'site.css', 'brand.css', 'site.js', '.nojekyll'):
        shutil.copy2(source / name, output / name)
    shutil.copytree(source / 'assets', output / 'assets')
    path = output / 'index.html'
    html = path.read_text()
    html, count = re.subn(r'<!-- full-site:start -->.*?<!-- full-site:end -->', '', html, flags=re.S)
    if count != 3:
        raise SystemExit('Expected three deferred legal/support navigation blocks')
    html = html.replace('<meta name="robots" content="noindex,nofollow">', '')
    path.write_text(html)
    (output / 'robots.txt').write_text('User-agent: *\nAllow: /\n')
print(f'Prepared {args.scope} release in _site/')
