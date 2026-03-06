## Problem
In `public/index.html` wird Inline-JavaScript ausgeführt, gleichzeitig gibt es keine definierte CSP.

## Repro-Schritte
1. `cd /home/sascha/Dokumente/werwolf-app`
2. `rg -n "Content-Security-Policy" public/index.html`
3. `rg -n "<script>" public/index.html`

## Logs
```text
# Schritt 2: kein Treffer
11:    <script>
```

## Impact
- XSS-Risiko ist höher als nötig.
- Keine klare Sicherheitsrichtlinie für Script-/Asset-Quellen.

## Fix-Idee
- Inline-Script in externe Datei `public/theme-init.js` auslagern.
- CSP-Meta-Tag mit restriktiver, App-kompatibler Policy ergänzen.
