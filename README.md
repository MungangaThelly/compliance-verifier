Projektidé för praktik hos IT-Weor AB: "Automatiserad Compliance-UI Verifierare"
 Bakgrund och Problemställning
 IT-Weor AB:s kunder behöver ofta verifiera att deras webbapplikationer uppfyller strikta compliance-krav (t.ex. SOC2, ISO27001) gällande:
 Säker rendering av känsliga data
 Korrekt CSP-implementation
 Skydd mot XSS/CSRF
 Åtkomstkontroll för UI-element
 Idag görs många av dessa kontroller manuellt eller med generiska säkerhetsverktyg som inte är anpassade för moderna JavaScript-ramverk.
 Lösningsförslag: En React-baserad Compliance-Verifierare
 Ett verktyg som automatiskt:
 1. Scanner live-webbappar och identifierar säkerhetsrisker
 2. Genererar compliance-rapporter med konkreta åtgärdsförslag
 3. Integrerar med IT-Weor AB:s API:er för att koppla resultat till kundens befintliga compliance-status
