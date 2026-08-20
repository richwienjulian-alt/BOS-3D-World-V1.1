# Einsatzlage – einheitliche Informationsarchitektur

## Verbindliche sichtbare Struktur
Für jede Mission identisch:

**EINSATZLAGE**

**[Missionsbezeichnung / Einsatzart]**        **[kompakter Status]**

**Aktuelle Phase** | **[kurze, handlungsorientierte Phasenbezeichnung]**

**[ein missionsspezifischer Lage-/Statussatz]**

**Einsatzfortschritt**

## Datenrollen
- **Titel:** Was ist passiert / wo?
- **Statuspill:** kompakte Kategorie, kein Langtext
- **Aktuelle Phase:** was passiert gerade operativ?
- **Beschreibung:** ein verständlicher Satz, der die aktuelle Lage erklärt
- **Fortschritt:** nur bestehender Prozentwert, keine neue KPI

## Missionsnummern
Missionsnummern werden bewusst **nicht** in Statuspill, Phase oder Beschreibung wiederholt.
Sie bleiben konsistent in:
- Missionsauswahl (`001`–`004`)
- Startbutton (`Mission 00X starten`)
- technischen/debugbezogenen Bereichen

Damit verschwinden uneinheitliche Formen wie `Mission 003 bereit`, ohne die Identität der Mission zu verlieren.

## Titel
- Mission 001: `Wohnungsbrand Innenstadt`
- Mission 002: `Medizinischer Notfall an der Arena`
- Mission 003: `Wasserleitungsleck Innenstadt`
- Mission 004: `Verkehrsunfall Ringstraße Nord`

## Technische Empfehlung
Die sichtbare Customer-Copy aus einer neuen Presentation-Layer beziehen. Die bestehenden Runtime-Methoden und Missionspläne bleiben unverändert und können weiterhin technische/legacy Texte liefern.
