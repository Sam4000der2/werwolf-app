## Problem
`public/index.html` referenziert ein nicht vorhandenes Touch-Icon (`logo192.png`). Im `public/` Verzeichnis liegt stattdessen `apple-touch-icon.png`.

## Repro-Schritte
1. `cd /home/sascha/Dokumente/werwolf-app`
2. `rg -n "apple-touch-icon" public/index.html`
3. `ls public | rg "logo192|apple-touch-icon"`

## Logs
```text
public/index.html: <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
public/: apple-touch-icon.png vorhanden, logo192.png fehlt
```

## Impact
- Falsches/fehlendes Icon auf iOS Home Screen.
- Browser-Console-404 für statische Asset-Referenz.

## Fix-Idee
Link in `index.html` auf `%PUBLIC_URL%/apple-touch-icon.png` korrigieren.
