## Problem
In `public/index.html` wird `frame-ancestors 'none'` innerhalb einer **Meta-CSP** gesetzt. Diese Direktive ist in Meta-CSP nicht wirksam und vermittelt einen falschen Eindruck von Clickjacking-Schutz.

## Repro-Schritte
1. `cd /home/sascha/Dokumente/werwolf-app`
2. `rg -n "frame-ancestors" public/index.html`

## Logs
```text
public/index.html: ... frame-ancestors 'none' ...
```

## Impact
- Sicherheits-Härtung ist scheinbar vorhanden, technisch aber wirkungslos.
- Erwarteter Framing-Schutz tritt ohne HTTP-Header nicht ein.

## Fix-Idee
`frame-ancestors` aus dem Meta-CSP entfernen und optional serverseitig als HTTP-Header setzen.
