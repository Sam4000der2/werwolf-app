# MEMORY

- werwolf-app: React + TypeScript + react-onsenui
- Icons: OnsenUI nutzt Font Awesome 5 (`all.min.css`) plus `v4-shims.min.css`
- Statuseffekte: Default-Icons muessen gueltige FA-IDs sein
- UX-Regel: Default-Statuseffekt-Symbole muessen auch in `availableIcons` auswaehlbar sein
- UX 2026-03: Effekt-Sortierung priorisiert aktive + Default-Effekte
- UX 2026-03: Nacht-Assistent dynamisch (inkl. Custom-Rollen), Schritt-Navigation
- UX 2026-03: Keine alert()-Meldungen in Komponenten/Reducer; stattdessen Status-Feedback
- Implementierung: `src/config.ts` baut `defaultEffectIcons` aus `defaultEffects` und mischt sie via `...defaultEffectIcons` in `availableIcons`
- UX 2026-03: Effekt-Dialog klickbar ueber Name + Beschreibung (nicht nur Checkbox)
- Spielregel 2026-03: `vergiftet` = Hexen-Gifttrank (Nacht-Effekt), Tod bei Tagbeginn
- Spielregel 2026-03: Hexe hat 1x Gift + 1x Heilung; nach beiden automatisch `faehigkeit_weg`
- Feature-Flags 2026-03: `confirmDialogs`, `narratorAssistant`, `persistentPlayerNames`, `prioritizeStatusEffects`
- Toolbar 2026-03: Einstellungs-Icon (`fa-cog`) oeffnet Dialog fuer optionale Fork-Funktionen
- Defaults 2026-03: Feature-Flags zentral in `src/config.ts`, `confirmDialogs` default `false`
