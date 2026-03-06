## Problem
Das default `npm test` startet im Watch-Modus und eignet sich dadurch schlecht für nicht-interaktive Läufe.

## Repro-Schritte
1. `cd /home/sascha/Dokumente/werwolf-app`
2. `npm run test`

## Logs
```text
No tests found related to files changed since last commit.
```
Prozess beendet sich ohne CI-Flags nicht zuverlässig selbst.

## Impact
- Lokale Smoke-Skripte und CI-nahe Nutzung können hängen.
- Testlauf ist nicht deterministisch, wenn keine geänderten Dateien erkannt werden.

## Fix-Idee
Default-Testskript auf nicht-watchend setzen (`--watchAll=false`).
