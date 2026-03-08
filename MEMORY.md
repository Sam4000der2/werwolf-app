# MEMORY

- werwolf-app: React + TypeScript + react-onsenui
- Icons: OnsenUI nutzt Font Awesome 5 (`all.min.css`) plus `v4-shims.min.css`
- Statuseffekte: Default-Icons muessen gueltige FA-IDs sein
- UX-Regel: Default-Statuseffekt-Symbole muessen auch in `availableIcons` auswaehlbar sein
- UX 2026-03: Effekt-Sortierung priorisiert aktive + Default-Effekte
- UX 2026-03: Nacht-Assistent dynamisch (inkl. Custom-Rollen), Schritt-Navigation
- UX 2026-03: Keine alert()-Meldungen in Komponenten/Reducer; stattdessen Status-Feedback
- Implementierung: `src/config.ts` baut `defaultEffectIcons` aus `defaultEffects` und mischt sie via `...defaultEffectIcons` in `availableIcons`
