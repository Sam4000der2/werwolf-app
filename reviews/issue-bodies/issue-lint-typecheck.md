## Problem
Im Projekt fehlen standardisierte npm-Skripte für Linting und Typecheck. `npx eslint` und `npx tsc --noEmit` funktionieren, aber `npm run lint` / `npm run typecheck` schlagen fehl.

## Repro-Schritte
1. `cd /home/sascha/Dokumente/werwolf-app`
2. `npm run lint`
3. `npm run typecheck`

## Logs
```text
npm error Missing script: "lint"
npm error Missing script: "typecheck"
```

## Impact
- CI/Automation kann Standard-Checks nicht über stabile Script-Namen aufrufen.
- Contributors müssen Tool-Befehle kennen statt über `npm run ...` zu arbeiten.

## Fix-Idee
In `package.json` Scripts ergänzen:
- `lint`: ESLint auf `src/**/*.{ts,tsx}`
- `typecheck`: `tsc --noEmit`
