"""Check static links/assets and prevent publishing unfinished legal/contact pages."""
import argparse
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.links, self.text = path, set(), [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if attrs.get(key):
                self.links.append(attrs[key])

    def handle_data(self, value):
        self.text.append(value)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--publish', action='store_true')
    parser.add_argument('--directory', default='dist')
    parser.add_argument('--scope', choices=('landing', 'full'), default='full')
    args = parser.parse_args()
    dist = (ROOT / args.directory).resolve()
    errors, pages = [], {}
    routes = ('index.html',) if args.scope == 'landing' else ('index.html', 'privacy/index.html', 'terms/index.html', 'support/index.html')
    if args.scope == 'landing':
        for route in ('privacy', 'terms', 'support'):
            if (dist / route).exists():
                errors.append(f'Unpublished route included: {route}')
    for route in routes:
        if not (dist / route).is_file():
            errors.append(f'Missing required page: {route}')
    for path in dist.rglob('*.html'):
        page = Page(path)
        page.feed(path.read_text())
        pages[path.resolve()] = page
    for path, page in pages.items():
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                continue
            target = ((dist / unquote(url.path).lstrip('/')) if url.path.startswith('/')
                      else (path.parent / unquote(url.path))) if url.path else path
            if target.is_dir():
                target /= 'index.html'
            target = target.resolve()
            if not target.is_relative_to(dist.resolve()) or not target.is_file():
                errors.append(f'{path.relative_to(dist)}: missing/invalid target {link}')
            elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
                errors.append(f'{path.relative_to(dist)}: missing anchor {link}')
        if args.publish:
            content = path.read_text()
            visible = ' '.join(page.text).lower()
            if any(marker in visible for marker in ('review draft', 'inbox is being created', 'setup pending', 'before publication')):
                errors.append(f'{path.relative_to(dist)}: unfinished draft wording')
            if re.search(r'noindex', content, re.I):
                errors.append(f'{path.relative_to(dist)}: indexing still disabled')
    if args.publish:
        support = pages.get((dist / 'support/index.html').resolve())
        if args.scope == 'full' and (not support or not any(link.startswith('mailto:') and '@' in link for link in support.links)):
            errors.append('Support needs an active email link to the verified inbox')
        robots = dist / 'robots.txt'
        if robots.exists() and re.search(r'^Disallow:\s*/\s*$', robots.read_text(), re.M | re.I):
            errors.append('robots.txt still blocks the entire site')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'Checked {len(pages)} pages: local links and assets valid' + ('; publication checks passed' if args.publish else ''))

if __name__ == '__main__':
    main()
