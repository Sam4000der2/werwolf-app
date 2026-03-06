## Problem
PWA/TWA-Metadaten sind inkonsistent (`lang`, `theme`, `display`, `scope`).

## Repro-Schritte
1. `cd /home/sascha/Dokumente/werwolf-app`
2. `rg -n "<html lang=|\"lang\"|theme-color|theme_color|display|scope|fullScopeUrl|start_url|startUrl" public/index.html public/manifest.json twa-manifest.json package.json`

## Logs
```text
public/index.html:2:<html lang="en">
public/manifest.json:39:  "lang": "de"
public/manifest.json:38:  "scope": "https://werwolf-berlin.de/"
twa-manifest.json:35:  "fullScopeUrl": "https://werwolf-berlin.de/"
```

## Impact
- Install-/Launch-Verhalten kann je nach Client uneinheitlich ausfallen.
- Sprache/Theme-Metadaten widersprechen sich zwischen App-Einstiegspunkten.

## Fix-Idee
- `index.html` Sprache auf `de`.
- Scope auf `/app/` konsistent setzen.
- Theme-/Display-Werte zwischen HTML, Web Manifest und TWA angleichen.
