# Three Eras

Turn-based team battler in a single HTML file. 24 heroes, 31 campaign stages, Gauntlet, custom battles.

## Quick start
```sh
npm run build          # dist/three-eras.html, open it in a browser
npm run build:all      # plus the offline file and the iPhone app (dist/app)
npm run balance        # balance research (needs Node 18+)
```
Browser tests need Python with Playwright: `pip install playwright && playwright install chromium`, then `npm run test:smoke`.

## Deploying the iPhone app
Push to `main` on GitHub. The workflow in `.github/workflows/pages.yml` builds `dist/app` and deploys it to GitHub Pages (one-time setup: Settings > Pages > Source: GitHub Actions). Open the Pages address in Safari, then Share > Add to Home Screen.

See `CLAUDE.md` for the rules, architecture and workflow, and `docs/` for the full developer handbook.
