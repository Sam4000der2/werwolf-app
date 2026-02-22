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

### Build Android App

- Install bubblewrap
- Set correct path to keystore in `twa-manifest.json`
- Run `bubblewrap update` to create app files
- Run `bubblewrap build` to build the apk

Somehow this assetlinks.json is needed to make the browser bar go away.
Doesn't work so far. Maybe it takes some time? Couldn't figure it out yet. Caching problem?
