## Problem
`npm audit` meldet `serve` als direkte Dependency mit `high` Severity-Risiken.

## Repro-Schritte
1. `cd /home/sascha/Dokumente/werwolf-app`
2. `npm audit --json`

## Logs
```text
"serve": {
  "severity": "high",
  "isDirect": true,
  "range": "7.0.0 - 14.2.5"
}
```

## Impact
- Erhöhtes Risiko in Dev-/Serve-Toolchain.
- Sicherheits-Scan bleibt unnötig rot durch veraltete direkte Version.

## Fix-Idee
Direkte Version auf aktuell verfügbaren Patchstand aktualisieren (`14.2.6`) und Lockfile refreshen.
