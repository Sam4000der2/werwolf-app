# Werwolf Helfer

Ein kleines Tool / App, die kontaktloses spielleiten von Werwolf ermöglicht.

https://werwolf-berlin.de/app/

## KI-Erweiterungen

Die App wurde per KI um zusätzliche Funktionen ergänzt.

Ergänzte Funktionen:
- Nacht-/Tag-Phasensteuerung mit Zählern für Tag und Nacht sowie Schaltfläche zum Phasenwechsel.
- Rollen-Aufwachlogik mit Nachtmodi: Nacht 0, jede Nacht, gerade Nächte, ungerade Nächte.
- Fraktionsbasierte Nachtrollen (z. B. böse Fraktionen) inklusive eigener Fraktionsverwaltung.
- Option `Zusätzlich als Rolle aufwachen` für Rollen, die sowohl mit Fraktion als auch eigenständig aufwachen.
- Zusätzlicher Hinweis `Aktiv` neben `wach`, wenn in einer Nacht beides gleichzeitig zutrifft (Fraktion + eigenständiges Aufwachen).
- Visuelle Markierung aufwachender Rollen in der Spielansicht.
- Erweiterte Effektverwaltung pro Spieler mit Dauer `permanent`, `night`, `next_day` sowie Erstellen/Löschen eigener Effekte.
- Spielername pro Sitzplatz im Spiel setzen/bearbeiten.
- Deck-Verwaltung: Speichern, Überschreiben, Laden, Löschen und Importieren von Decks.
- Backup/Restore für Rollen sowie Deck-Export/-Import als JSON.
- Theme-Umschaltung in der Toolbar (`system`, `light`, `dark`).
- Fehlergrenze (`AppErrorBoundary`) für robustere Laufzeitfehler-Behandlung.

## Entwicklung, Build und Deployment

### Voraussetzungen

- Node.js und npm (lokal)
- Linux/Unix-Shell für den aktuellen Build-Workflow (`ln -sfn` im Build-Script)
- Für Deployment zusätzlich: `rsync`, SSH-Zugang und Host-Alias `gobi`

### Lokale Entwicklung

```bash
npm install
npm start
```

### Build und Tests

```bash
npm run build
npm test
```

Hinweis: `npm run build` erstellt zusätzlich den Symlink `build/app`, damit die App unter `/app/` ausgeliefert werden kann.

### Runtime-Umgebungsvariable

Die Service-Worker-Registrierung ist standardmäßig deaktiviert und wird über folgende Variable gesteuert:

- `REACT_APP_ENABLE_SW=true`: Service Worker registrieren (Offline/PWA aktiv)
- jeder andere Wert oder nicht gesetzt: Service Worker wird deaktiviert

Siehe Beispielwerte in `.env.example`.

### Deployment

```bash
npm run deploy
```

Das Script ist aktuell auf die Zielumgebung `gobi:/srv/http/werwolf-berlin.de/web/` zugeschnitten und synchronisiert:

- `build/` nach `/srv/http/werwolf-berlin.de/web/app/`
- `build/.well-known/` nach `/srv/http/werwolf-berlin.de/web/.well-known/`

### Build Android App

- Install bubblewrap
- Set correct path to keystore in `twa-manifest.json`
- Run `bubblewrap update` to create app files
- Run `bubblewrap build` to build the apk

Somehow this assetlinks.json is needed to make the browser bar go away.
Doesn't work so far. Maybe it takes some time? Couldn't figure it out yet. Caching problem?
