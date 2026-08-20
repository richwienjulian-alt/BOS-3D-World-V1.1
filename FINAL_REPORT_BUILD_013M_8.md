# Mission BOS – Final Report Build 013M.8

## Ziel

Build 013M.8 schließt ausschließlich zwei Restpunkte aus der Sichtabnahme von 013M.7:

1. Mission 004 erhält einen expliziten und technisch nachweisbaren Rettungswagen-Rücklauf vom Krankenhaus zur Rettungswache.
2. Die Anwendung startet und resettiert auf eine niedrige, schräge, statisch gebäudesichere Customer-Kamerapose statt auf die hohe Vogelperspektive.

## Ergebnis der Implementierung

### A – Rettungswagen-Rücklauf

**Technisch PASSED.**

- vollständige Mission-004-Hospital-Return-Route im aktiven Profil;
- generische, rückwärtskompatible Renderer-Unterstützung für optionale `hospitalReturnRoute`;
- 2,5-s-Krankenhaus-Hold;
- genau ein erfolgreicher Return-Command;
- tatsächlicher Renderer-State `RETURNING` ist zwingend;
- 0,35-s-Watchdog bis `RETURNING`;
- 6,0-s-Watchdog bis `AT_STATION`;
- tatsächliche technische Rückfahrdauer: 3,10 s;
- 10/10 technische vollständige Mission-004-Zyklen zurück zu `READY`;
- Frozen technische Trace-Prüfung: PASSED;
- Fire/Police- und Downtown-Return-Corridor unverändert PASSED.

### B – Startkamera

**Statisch PASSED.**

```text
Position = (0.78, 9.00, 46.00)
Target   = (0.78, 2.50, 10.00)
FOV      = 56
Pitch    = -0.17863100651394934
freeCameraHeight = 9
Nearest building I05 clearance = 10.171 m
```

Die hohe Stadtübersicht bleibt als manuelle Presenter-Option bestehen. Es wurde kein automatischer Kameraflug hinzugefügt.

## Regressionsschutz

Technisch PASSED:

- Mission 001 vollständiger Controller-Smoke;
- Mission 002 vollständiger Controller-Smoke und bestehende Ambulanzroute unverändert;
- Mission 003 vollständiger Controller-Smoke;
- Mission-004-Swept-Path / No-Cross;
- Mission-004 Fire/Police Return Maneuver;
- Downtown Return Corridor;
- Mission-004 Network Timing;
- Source Regression.

Dashboard, `style.css`, Response-Vehicle-Renderer und Funkgrundarchitektur wurden nicht verändert.

## Browser-/WebGL-Abnahme

Die reale Sichtabnahme konnte in der isolierten Build-Umgebung **nicht ausgeführt** werden. Der lokale HTTP-Server liefert den Build aus, der verwaltete Chromium ersetzt die Navigation jedoch vor Seitenabruf durch:

```text
chrome-error://chromewebdata/
Your organization doesn’t allow you to view this site
```

`THREE` und Mission-Runtime sind in diesem Fehlerdokument nicht geladen und es existiert kein Canvas. Daher wurde weder ein echter WebGL-Trace noch eine visuelle 5-Läufe-Abnahme vorgetäuscht.

## Freigabestatus

```text
Implementation complete:                  YES
Static/Frozen validation:                 PASSED
Technical renderer/controller validation: PASSED
Technical mission regressions:            PASSED
Real browser trace:                       PENDING
Five-run WebGL visual acceptance:         PENDING
Formal PASSED / Release Candidate:        NO
```

Build 013M.8 ist damit ein technisch validierter **Browser-Acceptance-Kandidat**, aber gemäß der verbindlichen Abnahmeregel noch kein formal freigegebener Präsentations-/Release Candidate. Die letzte Freigabe erfolgt nach fünf erfolgreichen realen Mission-004-Sichtläufen gemäß lokaler Testanleitung.
