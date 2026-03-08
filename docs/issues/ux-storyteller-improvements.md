# UX-Verbesserungen fuer Spielleitung

## Problemstatement
Die Bedienung in Vorbereitung und Spielleitung war an einigen Stellen fehleranfaellig:
- Statuseffekte waren nicht optimal priorisiert.
- Nacht-Reihenfolge war starr statt dynamisch.
- Mehrere kritische Aktionen waren leicht fehlzuklicken.
- Rueckmeldungen liefen teils ueber blockierende Browser-Alerts.

## Repro-Schritte
1. Ein Spiel mit mehreren Nachtrollen starten.
2. In `Spiel leiten` den Erzähler-Assistenten nutzen.
3. Einen neuen Effekt erstellen und vorhandene Effekte verwalten.
4. In `Vorbereitung` Decks importieren/loeschen und Rollenmodi anpassen.

## Expected Behavior
- Relevante Statuseffekte stehen oben.
- Nacht-Assistent zeigt alle aktiven Rollen in sinnvoller Reihenfolge.
- Kritische Aktionen sind bestaetigt und klar beschriftet.
- Fehler-/Statusmeldungen erscheinen inline ohne Modalfokus-Unterbrechung.

## Akzeptanzkriterien
- Effektliste priorisiert aktive und Default-Effekte.
- Nacht-Assistent ist dynamisch und fuer Tastatur bedienbar.
- Destruktive Aktionen haben Bestaetigung.
- Keine `alert()`-Nutzung mehr in UI/Reducer.
- Touch-Targets sind fuer mobile Bedienung vergroessert.
