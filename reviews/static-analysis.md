# Static Analysis Report (Worker A)

Date: 2026-03-05  
Repo: `/home/sascha/Dokumente/werwolf-app`

## Scope
- Reviewed lint/type/static-analysis setup from `package.json` and `tsconfig.json`.
- Ran relevant static commands against the current uncommitted baseline.
- Did not modify any source files.

## Baseline State
- `git status --short` showed only:
  - `?? AGENTS.md`
- No tracked source-file diffs were present in baseline.

## Inspected Scripts and Config
- `package.json:33-39`
  - `start`: `react-scripts start`
  - `build`: `react-scripts build && ln -sfn . build/app`
  - `test`: `react-scripts test`
  - `eject`: `react-scripts eject`
  - `deploy`: rsync deployment command
- `package.json:49-54`
  - ESLint config extends `react-app` and `react-app/jest`.
- `tsconfig.json:2-21`
  - `strict: true`, `noEmit: true`, `skipLibCheck: true`, `allowJs: true`.

## Exact Commands Run
```bash
pwd && ls -la
rg --files -g 'package.json' -g 'pnpm-lock.yaml' -g 'yarn.lock' -g 'package-lock.json' -g 'tsconfig*.json' -g '.eslintrc*' -g 'eslint.config.*' -g '.prettierrc*' -g 'biome.json*' -g '.stylelintrc*' -g 'vite.config.*' -g 'next.config.*' -g 'nuxt.config.*' -g 'jest.config.*' -g 'vitest.config.*' -g 'turbo.json' -g 'nx.json'
git status --short
cat package.json
cat tsconfig.json
npx eslint src --ext .js,.jsx,.ts,.tsx
npx tsc --noEmit
npm run build
rg -n "@ts-ignore|eslint-disable|\bany\b|TODO|FIXME" src
nl -ba src/service-worker.ts | sed -n '1,220p'
```

## Output Summary
- `npx eslint src --ext .js,.jsx,.ts,.tsx`
  - Exit code: `0`
  - Output: none (no lint findings reported)
- `npx tsc --noEmit`
  - Exit code: `0`
  - Output: none (no type errors reported)
- `npm run build`
  - Exit code: `0`
  - Key output:
    - `Creating an optimized production build...`
    - `Compiled successfully.`
    - `The build folder is ready to be deployed.`
- Pattern scan (`rg`)
  - Match found at `src/service-worker.ts:2`:
    - `/* eslint-disable no-restricted-globals */`
  - Additional matches were comment text only (`any`) and not code-level issues.

## Findings
**0 findings**

## Risks / Notes
- No actionable static-analysis, lint, or type-check defects were detected in the current baseline.
- The file-level suppression at `src/service-worker.ts:2` appears intentional for service-worker globals and did not correlate with a concrete defect.
