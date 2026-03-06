# Build/Test/Smoke Report (Worker B)

- Repo: `/home/sascha/Dokumente/werwolf-app`
- Date: 2026-03-05
- Scope: build/test/smoke/start-script checks only (no source edits)

## Commands Run (exact)

1. `npm run build`
2. `CI=true npm test -- --watch=false`
3. `timeout 45s env BROWSER=none HOST=127.0.0.1 PORT=3005 npm run start`
4. `bash -lc 'npx --no-install serve -s build -l 4173 >/tmp/werwolf-serve.log 2>&1 & pid=$!; sleep 3; echo "HTTP HEAD:"; curl -sS -I http://127.0.0.1:4173/app/ | sed -n "1,5p"; echo ""; echo "HTML snippet:"; curl -sS http://127.0.0.1:4173/app/ | sed -n "1,3p"; kill $pid; wait $pid 2>/dev/null || true; echo ""; echo "serve log tail:"; tail -n 20 /tmp/werwolf-serve.log'`

## Summarized Output

### 1) Build
- Result: PASS (exit 0)
- Key output:
  - `Compiled successfully.`
  - Build artifacts generated under `build/`
  - `build/app` symlink step completed (`ln -sfn . build/app` in script)

### 2) Test
- Result: FAIL (exit 1)
- Key output:
  - `No tests found, exiting with code 1`
  - `Run with --passWithNoTests to exit with code 0`
  - Jest scan summary reported 0 matches for configured test patterns.

### 3) Start script (dev server)
- Result: STARTS OK, then expected timeout (exit 124 due `timeout 45s`)
- Key output:
  - `Starting the development server...`
  - `Compiled successfully!`
  - Served URL: `http://127.0.0.1:3005/app`
- Non-blocking warning observed:
  - `DEP_WEBPACK_DEV_SERVER_ON_AFTER_SETUP_MIDDLEWARE` deprecated
  - `DEP_WEBPACK_DEV_SERVER_ON_BEFORE_SETUP_MIDDLEWARE` deprecated

### 4) Smoke check (built app serving)
- Result: PASS (exit 0)
- HTTP probe output:
  - `HTTP/1.1 200 OK` for `HEAD /app/`
  - HTML returned for `GET /app/` (doctype + app assets present)
- `serve` log confirms successful requests and 200 responses.

## Reproducible Problems & Likely Root Causes

### Finding 1: Test command fails in CI-style execution
- Repro:
  - Run `CI=true npm test -- --watch=false`
- Observed:
  - Exit code 1 with `No tests found`
- Likely root cause:
  - No test files match CRA/Jest patterns (`src/**/__tests__/**/*` and `src/**/*.{spec,test}.*`), and Jest default behavior is to fail when none are found.
- Impact:
  - CI pipelines that run `npm test` in CI mode will fail even if app builds and runs.

### Finding 2: Dev-start emits webpack-dev-server deprecation warnings (non-failing)
- Repro:
  - Run `npm run start`
- Observed:
  - Node deprecation warnings for `onAfterSetupMiddleware` / `onBeforeSetupMiddleware`
- Likely root cause:
  - `react-scripts@5.0.1` depends on older webpack-dev-server configuration paths.
- Impact:
  - No current functional failure, but indicates aging tooling and potential future breakage risk with newer Node/toolchain changes.

## Final Status
- Findings: 2
- Build: pass
- Test: fail
- Start script: pass (with expected timeout harness exit)
- Smoke: pass
