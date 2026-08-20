# Mission BOS – Changelog Build 013M.5

## Titel
Mission 004 – Maneuver-aware Rücklauf: Feuerwehr-Backout, Clearance-Turn und Polizei-Gate

## Basis
- Einzige Implementierungsbasis: `Mission-BOS-Build-013M.4`
- Verifizierter SHA-256 der gelieferten Basis: `9dbe89a1ecc6c93babacd21b3e7af705f3b692806dd1a8edf48b7ac449572e0a`
- Keine ältere Build-ZIP wurde als Implementierungsquelle verwendet.

## Zielkorrektur
Build 013M.5 korrigiert ausschließlich den verbleibenden Mission-004-Rücklaufkonflikt, der durch die tatsächliche geglättete Winkelinterpolation am Stage-Endpunkt entstand. Stage-Positionen, No-Cross-Logik und Mobilfunkkalibrierung bleiben erhalten.

## Änderungen

### `city-response-vehicle-renderer.js`
Der bestehende Response Renderer wurde additiv um maneuver-aware Return-Profile erweitert. Es wurde keine zweite Mission-004-Bewegungsengine eingeführt.

Mission 004 verwendet nun:
1. Feuerwehr `RETURN_CLEARING`
   - Start ohne zusätzliche Verzögerung.
   - 6.0 m Backout entlang der bereits existierenden Route.
   - Backout-Speed 2.0 m/s.
   - Während des Backouts bleibt das normale Outbound-Heading erhalten.
2. Feuerwehr `RETURN_TURNING`
   - Erst nach vollständigem Backout beginnt die vorhandene geglättete Drehung zum Reverse Heading.
   - Jede Zwischenlage bleibt Teil der normalen `evaluateSafety()`-Prüfung.
3. Gate `M004_FIRE_CLEARANCE_TURN_COMPLETE`
   - Wird erst nach vollständig abgeschlossener Feuerwehrdrehung gesetzt.
4. Polizei `RETURN_WAITING`
   - Wartet auf das Feuerwehr-Gate und mindestens 4.0 s Return-Delay.
5. Polizei `RETURN_TURNING` und anschließend reguläres `RETURNING`.

`setRouteProfile()` übernimmt die Maneuver-Daten aus dem Route-Profil. Der bestehende Standard-Rücklauf anderer Missionen bleibt erhalten.

Die statische Mission-004-Profilprüfung simuliert nun den maneuver-aware Rücklauf einschließlich Zwischenwinkeln, Footprints, 0.05-m-Safety-Margin und 0.01-s-Schrittweite.

### `city-mission-004-response-controller.js`
- Übergibt die Frozen `returnSequencing`-Daten als `returnManeuver` an den bestehenden Response Renderer.
- Prüft die Verfügbarkeit von `getReturnManeuverStatus()`.
- Stellt `getReturnManeuverStatus()` öffentlich und rein lesend über die Mission-004-Response-Fassade bereit.

### `app.js` / `index.html`
- Neuer Frozen Return-Maneuver-Contract und Validator werden geladen und ausgeführt.
- Mission 004 wird nur als technisch valide Runtime akzeptiert, wenn Return-Maneuver-Contract und neuer Return-Route-Validator `PASSED` melden.

### Frozen Preparation-Dateien
Bytegenau aus dem 013M.5-Preparation-Paket übernommen und nicht verändert:
- `city-mission-004-plan.js`
- `mission-004-validator.js`
- `city-mission-004-return-maneuver-contract.js`
- `mission-004-return-maneuver-contract-validator.js`
- `mission-004-return-route-validator.js`

## Bewusst unverändert
- Stage-Positionen:
  - `RESPONSE_FIRE_01`: x=26.0 / z=39.7
  - `RESPONSE_POLICE_01`: x=24.0 / z=42.0
  - `AMBULANCE_01`: x=28.0 / z=42.0
- Mission-004 No-Cross-/Traffic-Clearance-Logik
- Mission-004 Incident-Cell-/Network-Timing-Kalibrierung
- `city-network-radio-model.js`
- `city-network-association-controller.js`
- `city-layout-recovery.js`
- `city-traffic-plan.js`
- alle `city-mission-001*`, `city-mission-002*` und `city-mission-003*` Quellen

## Technische Abnahme
Der Frozen Return-Validator weist zuerst die bekannte 013M.4-Lücke nach und danach die neue Sequenz:
- `baselineTurningCollisionDetected = true`
- `baselineFirstCollisionTimeSeconds = 0.05`
- `minimumStaticFireBackoutForSafeTurnMeters = 6.0`
- `fireBackoutDistanceMeters = 6.0`
- `fireGateTimeSeconds = 3.34`
- `policeTurnStartTimeSeconds = 4.00`
- `configuredCollisionCount = 0`
- `totalReturnTimeSeconds = 28.80`
- Status: `PASSED`

Ein zusätzlicher Harness gegen den echten `city-response-vehicle-renderer.js` mit aktiver `evaluateSafety()`-Logik bestätigte 5/5 deterministische Rückläufe bis `AT_STATIONS` ohne Response/Response-Kollision.

## Freigabestatus
Technische Validierung: **PASSED**  
Reale Browser-Sichtabnahme des vollständigen Rücklaufs: **NOT EXECUTED / ausstehend**  
Interner Release Candidate: **NO**, bis die reale Browser-Sichtabnahme bestanden ist.
