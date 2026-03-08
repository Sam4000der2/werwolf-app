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
- Klick auf Effektname + Effektbeschreibung toggelt den Effekt direkt.
- Nacht-Assistent ist dynamisch und fuer Tastatur bedienbar.
- Destruktive Aktionen haben Bestaetigung.
- Keine `alert()`-Nutzung mehr in UI/Reducer.
- Touch-Targets sind fuer mobile Bedienung vergroessert.
- Hexe: `vergiftet` ist kein permanenter Effekt, Gift-/Heiltrank sind jeweils nur 1x nutzbar, danach bekommt die Hexe automatisch `Fähigkeit verbraucht`.
- Oben in der Toolbar gibt es ein Einstellungs-Icon zur gezielten Aktivierung/Deaktivierung von Funktionen.
- Zusatzdialoge sind ueber Feature-Flag steuerbar und standardmaessig deaktiviert (Default aus `config.ts`).
- Feature-Schalter orientieren sich an den Fork-Unterschieden: `Decks & Backups`, `Default-Statuseffekte`, `Nacht-Assistent & Fraktionen/Nachtschemata`, `Rollen-Kategorien`.
- `Darkmode` und `Spielernamen` bleiben fest aktiv verfuegbar und sind nicht als abschaltbare Option in den Einstellungen.
- Wenn `Nacht-Assistent & Fraktionen/Nachtschemata` deaktiviert ist, ist die Spielleitung dauerhaft im Tag-Modus und Tag/Nacht-Wechsel sind ausgeblendet.
- In diesem Modus sind alle Statuseffekte auswaehlbar; Dauerinformationen werden im Effekt-Picker ausgeblendet.
- Beim manuellen Anlegen eines Effekts fehlt in diesem Modus die Dauer-Auswahl; intern wird immer `permanent` gespeichert.
