## Problem
README bezeichnet `REACT_APP_ENABLE_SW` als Runtime-Variable, wird aber im CRA-Bundle zur Build-Zeit ausgewertet.

## Repro-Schritte
1. `cd /home/sascha/Dokumente/werwolf-app`
2. `rg -n "Runtime-Umgebungsvariable|REACT_APP_ENABLE_SW" README.md src/index.tsx`

## Logs
```text
README.md: Runtime-Umgebungsvariable
src/index.tsx: const offlineModeEnabled = process.env.REACT_APP_ENABLE_SW === "true";
```

## Impact
- Deploy-Dokumentation ist missverständlich.
- Betreiber erwarten zur Laufzeit änderbares Verhalten, das so nicht existiert.

## Fix-Idee
README auf Build-time-Semantik korrigieren und Beispiel-Workflow ergänzen.
