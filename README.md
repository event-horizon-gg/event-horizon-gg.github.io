# Event Horizon

Source for the Event Horizon website and shared privacy, terms and support pages.

Intended address: https://event-horizon-gg.github.io/

## Preview and edit

Requires Python 3. The site has no package installation or build dependencies.

```sh
python3 build-pages.py
python3 scripts/check-site.py
python3 -m http.server 8766 --directory dist --bind 127.0.0.1
```

Open http://127.0.0.1:8766/.

- Homepage: `dist/index.html`, `base.css`, `site.css`, `site.js`.
- Shared pages: edit `build-pages.py`, then regenerate them.
- Legal-page styling: `dist/legal.css`.
- Header lettering: the original artwork in `dist/assets/eventhorizon-original.png`, displayed by `dist/brand.css` without redrawing it.

Keep the approved Immense hero and satellite transition. Shared pages stay minimal: no app catalogue, FAQ or troubleshooting guide. There are no added analytics, tracking cookies, external fonts or runtime libraries.

## Publication

GitHub Pages uses GitHub Actions. Pushes and pull requests validate the source but never deploy it. The **Publish website** workflow runs manually from `main` only.

The default `landing` scope publishes the homepage and its assets only. Legal/support pages and their navigation links are excluded from the artifact. The `full` scope includes the shared pages and requires the publication checks below to pass.

To publish the landing page, run **Publish website** from `main` with scope **landing**. The workflow builds the generated `_site/` directory and validates it before deployment.

Before publishing the full site:

1. Confirm the support inbox works; activate its email link and remove the setup-pending text.
2. Complete the publisher/contact and privacy disclosures against the apps being released. Resolve any outstanding third-party processing review, retention and transfer details.
3. Replace review-draft dates/status with the effective date, remove `noindex,nofollow` and update `dist/robots.txt` for the public site. Regenerate the shared pages.
4. Run `python3 scripts/check-site.py --publish`. It deliberately rejects incomplete drafts and an inactive contact link.
5. Merge the completed content through a pull request.
6. Confirm Settings → Pages still uses **GitHub Actions** as the source.
7. Run **Publish website** from `main` in Actions with scope **full** and verify `/`, `/privacy/`, `/terms/` and `/support/` at the public HTTPS address.

The deployment workflow uploads only the selected `_site/` artifact, using GitHub's built-in token. No domain, paid hosting or additional deployment secret is needed. Once published, use the same privacy and support URLs in the apps and App Store Connect.
