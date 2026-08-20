# Protected Components – Build 013M.16

Besonders zu schützen:

- Mission 001–004 State Machines und Missionsabläufe,
- Mission-004-Abschluss und M004→M002-Recovery aus 013M.15,
- Ambulanzlogik und Krankenhausroute,
- bestehende Feuerwehr-/Polizeirouten und Dispatch-Kalibrierung,
- bestehende Mission-004-Rückfahrmanöver,
- Stadt-/Straßengeometrie,
- Traffic-Routen,
- Fußgängerrouten,
- Mobilfunk-/Association-/Cell-Load-/Capacity-/BOS-Priority-Architektur,
- Customer-Dashboard-Struktur und Copy.

Die einzigen erwarteten Produktionsänderungen stehen in `IMPLEMENTATION_DELTA_MAP.md`. Alle anderen Root-JS/HTML/CSS-Dateien werden über `PROTECTED_SOURCE_HASHES.txt` geschützt.
