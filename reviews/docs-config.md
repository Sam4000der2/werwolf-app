# Docs/Config Review (Worker D)

Date: 2026-03-05  
Repo: `/home/sascha/Dokumente/werwolf-app`  
Scope: README/docs/config/start/build/deploy consistency, env var documentation, path assumptions, deployment/build config mismatches.

## Exact Commands Run
```bash
pwd && ls -la
rg --files | rg -i '(^|/)(readme|README|docs/|docker|compose|vercel|netlify|railway|render|fly|Procfile|package\.json|pnpm-workspace|turbo|vite\.config|next\.config|nuxt\.config|svelte\.config|tsconfig|\.env|env\.example|start|build|deploy|Makefile)'
git status --short
ls -la build && rg --files build
cat package.json
cat README.md
cat tsconfig.json
ls -la public && rg --files public
cat public/index.html
cat public/manifest.json
cat twa-manifest.json
rg -n "process\.env|REACT_APP|import\.meta\.env|dotenv|ENV" src public README.md package.json twa-manifest.json
rg -n "npm (start|run build|run test|run deploy)|yarn|bubblewrap|deploy|build|start|REACT_APP_ENABLE_SW|PUBLIC_URL|NODE_ENV|\.well-known|app/" README.md AGENTS.md package.json public/manifest.json twa-manifest.json src
ls -la public/.well-known && rg --files public/.well-known && for f in public/.well-known/*; do echo '---' "$f"; cat "$f"; done
sed -n '1,180p' src/index.tsx
sed -n '1,220p' src/serviceWorkerRegistration.ts
sed -n '1,220p' src/service-worker.ts
cat .gitignore
git ls-files build | head -n 40 && echo '---' && git ls-files public/.well-known && echo '---' && git ls-files reviews
rg -n "logo192|apple-touch-icon" build/index.html public/index.html public/manifest.json
for f in public/logo192.png public/apple-touch-icon.png build/logo192.png build/apple-touch-icon.png; do if [ -e "$f" ]; then echo "EXISTS $f"; else echo "MISSING $f"; fi; done
node -p "const p=require('./package.json'); ({version:p.version,homepage:p.homepage,scripts:p.scripts})"
node -p "const t=require('./twa-manifest.json'); ({appVersion:t.appVersion,appVersionName:t.appVersionName,appVersionCode:t.appVersionCode,startUrl:t.startUrl,host:t.host,signingKeyPath:t.signingKey.path})"
nl -ba README.md | sed -n '1,220p'
nl -ba package.json | sed -n '1,220p'
nl -ba public/index.html | sed -n '1,220p'
nl -ba twa-manifest.json | sed -n '1,220p'
nl -ba src/index.tsx | sed -n '55,110p'
ls -l build/app
```

## Findings

### 1) Broken Apple touch icon reference in HTML template
- Severity: Medium
- Evidence:
  - `public/index.html:10` references `%PUBLIC_URL%/logo192.png`.
  - `public/logo192.png` and `build/logo192.png` are missing.
  - Existing icon file is `public/apple-touch-icon.png`.
- Impact:
  - iOS home-screen icon link resolves to a 404 (`/app/logo192.png`) in production build.
  - Can degrade install/add-to-home-screen polish and icon behavior on Apple devices.
- Fix idea:
  - Change `public/index.html` link target to `%PUBLIC_URL%/apple-touch-icon.png`, or add `logo192.png` consistently.

### 2) `REACT_APP_ENABLE_SW` is used but not documented
- Severity: Medium
- Evidence:
  - `src/index.tsx:68` gates service worker registration with `process.env.REACT_APP_ENABLE_SW === "true"`.
  - No mention of `REACT_APP_ENABLE_SW` in `README.md`.
  - No `.env.example` file documents expected env flags.
- Impact:
  - Developers may assume offline/PWA behavior is active in prod while it is silently disabled unless env var is set.
  - Inconsistent behavior across local/staging/prod due to undocumented build-time flag.
- Fix idea:
  - Document the flag in README (`default`, accepted values, recommended prod setting).
  - Add a `.env.example` with `REACT_APP_ENABLE_SW=` and comments.

### 3) Start/build/deploy scripts are environment-specific but undocumented
- Severity: Medium
- Evidence:
  - `package.json:35` uses `ln -sfn . build/app` (Unix-specific).
  - `package.json:38` deploy script assumes `rsync`, SSH host alias `gobi`, and fixed server paths.
  - `README.md` contains Android bubblewrap steps, but no instructions for npm start/build/test/deploy prerequisites.
- Impact:
  - New contributors cannot reliably run build/deploy without tribal knowledge.
  - CI or non-Linux environments can fail or diverge due to shell/tool assumptions.
- Fix idea:
  - Add a “Development & Deployment” section documenting required tools (`node/npm`, `rsync`, SSH alias setup), expected server paths, and purpose of `build/app` symlink.
  - Optionally split deploy into parameterized script/env-based command to reduce hard-coding.

### 4) Web and TWA version metadata are out of sync
- Severity: Low
- Evidence:
  - `package.json:3` version is `2.0.1`.
  - `twa-manifest.json:22`/`:41` app version is `2.0.2`.
- Impact:
  - Release tracking can drift between web build and Android/TWA packaging.
  - Increases risk of shipping mismatched changelog/version labels.
- Fix idea:
  - Define a single version source of truth (script or release checklist step syncing `package.json` and `twa-manifest.json`).

## Notes
- No source files were modified during this review.
- This review found 4 findings.
