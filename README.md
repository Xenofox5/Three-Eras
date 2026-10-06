# Three Eras

Turn-based team battler in a single HTML file. 24 heroes, 31 campaign stages, Gauntlet, custom battles.

## Quick start
```sh
npm run build          # dist/three-eras.html, open it in a browser
npm run build:all      # plus the offline file and the iPhone app (dist/app)
npm run balance        # balance research (needs Node 18+)
```
Browser tests need Node 22+ and any installed Chrome, Edge or Chromium, with nothing to install:
```sh
npm run test:smoke       # about a minute
npm run test:regression  # every stage, custom battle and Gauntlet waves
```
Set `TE_HTML` to test another build and `TE_BROWSER` if your browser is somewhere unusual. The older Playwright versions are still there as `npm run test:smoke:py` (needs `pip install playwright && playwright install chromium`).

## Deploying the iPhone app
Push to `main` on GitHub. The workflow in `.github/workflows/pages.yml` builds `dist/app` and deploys it to GitHub Pages (one-time setup: Settings > Pages > Source: GitHub Actions). Open the Pages address in Safari, then Share > Add to Home Screen.

See `CLAUDE.md` for the rules, architecture and workflow, and `docs/` for the full developer handbook.
