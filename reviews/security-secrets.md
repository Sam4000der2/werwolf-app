# Security / Secrets / Dependency Review

Date: 2026-03-05
Reviewer: Worker C
Scope: `/home/sascha/Dokumente/werwolf-app`

## Findings

1. **High** - Dependency vulnerabilities in active dependency graph (including production install set)
- `npm audit --json` reports **31 vulnerabilities** total: `high: 18`, `moderate: 4`, `low: 9`.
- `npm audit --omit=dev --json` still reports **28 vulnerabilities** in non-dev dependency graph: `high: 16`, `moderate: 3`, `low: 9`.
- Key vulnerable direct/transitive chain is centered around `react-scripts@5.0.1` with advisories in `webpack-dev-server`, `svgo`, `serialize-javascript`, `workbox-*`, etc.
- Notable advisory surfaced by audit: `rollup` path traversal advisory (`GHSA-mw96-cpmx-2vgc`) appears in dependency tree.
- Evidence (from audit output):
  - direct: `react-scripts@5.0.1`
  - metadata (`--omit=dev`): `"total": 28`, `"high": 16`, `"moderate": 3`, `"low": 9`

2. **Low** - Runtime errors are logged verbatim to browser console
- `src/components/AppErrorBoundary.tsx:19` logs raw error object:
  - `console.error("AppErrorBoundary caught runtime error", error);`
- In browser contexts this can expose internal stack/context details to anyone with local console access (shared device/kiosk scenarios). No direct secret exfiltration found, but this is a potential leakage surface.

## Areas Checked With No Findings

- Hardcoded secrets/API tokens/private keys: **no matches** from regex scan across tracked source/config docs (`src`, `public`, `package.json`, `README.md`, `AGENTS.md`) excluding `node_modules`, `.git`, `build`.
- Checked for committed credential-like files (`*.pem`, `*.key`, `*.p12`, `*.pfx`, `id_rsa`, `*.jks`): **none found**.
- Checked for local `.env*` files in repo root: **none found**.
- App-level path traversal/file access misuse in source: no `fs`/`path` usage in app code; file import flow uses browser `File` API with file-size cap and JSON parsing, with normalization guards in reducer logic (`src/components/Preparation.tsx`, `src/reducers/game.ts`).
- Dangerous dynamic code/HTML sinks (`eval`, `new Function`, `dangerouslySetInnerHTML`, `document.write`): **no matches** in `src`.

## Exact Commands Run + Key Outputs

1. `pwd && ls -la`
- Confirmed working directory and repo layout. Includes `package.json`, `package-lock.json`, `src/`, `reviews/`.

2. `rg --files | head -n 200`
- Confirmed TypeScript React app source inventory.

3. `git status --short`
- Output: `?? AGENTS.md` (pre-existing untracked file; not modified by this review).

4. Secret pattern scan:
- Command:
  - `rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!build/**' "(AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|AIza[0-9A-Za-z\-_]{35}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{82}|xox[baprs]-[A-Za-z0-9-]{10,}|sk_live_[0-9a-zA-Z]{24,}|sk_test_[0-9a-zA-Z]{24,}|-----BEGIN (RSA|EC|OPENSSH|DSA|PGP) PRIVATE KEY-----|(?i)(api[_-]?key|secret|token|password|passwd|pwd)\s*[:=])"`
- Key output: no matches (exit code 1).

5. Insecure pattern/logging/storage scan:
- Command:
  - `rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!build/**' "(eval\(|new Function\(|child_process|exec\(|spawn\(|dangerouslySetInnerHTML|innerHTML\s*=|localStorage|sessionStorage|document\.cookie|console\.(log|debug|info|warn|error)|JSON\.stringify\(.*(password|token|secret)|fetch\(|axios\.|XMLHttpRequest|fs\.|path\.join|path\.resolve|\./\.\.|\.\./)" src package.json README.md AGENTS.md`
- Key output highlights:
  - `src/components/AppErrorBoundary.tsx:19` -> `console.error(...)`
  - multiple `localStorage` usage in reducers (`src/reducers/ui.ts`, `src/reducers/game.ts`)
  - service worker logging in `src/serviceWorkerRegistration.ts`

6. Environment variable scan:
- Command:
  - `rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!build/**' "(\.env|dotenv|process\.env|REACT_APP_|VITE_|NEXT_PUBLIC_|SECRET|TOKEN|PASSWORD|API_KEY)"`
- Key output highlights:
  - `src/index.tsx:68` (`REACT_APP_ENABLE_SW`)
  - `.gitignore` excludes `.env` files
  - no hardcoded secret values found

7. URL/path/file-handling scan:
- Commands:
  - `rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!build/**' "(http://|https://|ws://|wss://)" src public README.md package.json`
  - `rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!build/**' "(\.{2}/|path\.resolve|path\.join|fs\.|FileReader|Blob|URL\.createObjectURL|download|upload|multipart|FormData)" src`
  - `rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!build/**' "dangerouslySetInnerHTML|innerHTML\s*=|eval\(|new Function\(|document\.write\(|setTimeout\(\s*['\"]|setInterval\(\s*['\"]" src`
- Key output highlights:
  - Browser download/import flow in `src/components/Preparation.tsx` (Blob/ObjectURL/file input)
  - no dangerous dynamic execution/HTML insertion sinks found

8. Dependency audit:
- Commands:
  - `npm audit --json`
  - `npm audit --omit=dev --json`
- Key output summaries:
  - Full: `total 31` (`high 18`, `moderate 4`, `low 9`)
  - Omit dev: `total 28` (`high 16`, `moderate 3`, `low 9`)
  - Direct package check:
    - `npm ls react-scripts serve --depth=0`
    - Output: `react-scripts@5.0.1`, `serve@14.2.5`

9. Optional scanner availability check:
- Command:
  - `command -v gitleaks || true; command -v trufflehog || true; command -v semgrep || true`
- Key output: no paths returned (tools not installed in current environment).

10. Credential file / env file presence checks:
- Commands:
  - `ls -la .env* 2>/dev/null || true`
  - `find . -maxdepth 4 -type f \( -name '*.pem' -o -name '*.key' -o -name '*.p12' -o -name '*.pfx' -o -name 'id_rsa' -o -name '*.jks' \) | sed 's#^./##'`
- Key output: no files returned.

## Recommended Remediation

1. Prioritize dependency modernization away from `react-scripts@5.0.1` (or aggressively override vulnerable transitives where safe), then re-run `npm audit --omit=dev` until high/moderate findings are cleared.
2. Gate or sanitize production error logging in `AppErrorBoundary` to reduce data leakage in console.

