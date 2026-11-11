# DeGoogleYourself

Friares fristående kodprojekt för lokal körning. Skapa en flyttplan från Googles tjänster och följ guiderna för de alternativ du väljer.

Kontakt för projektet: [degooglify@proton.com](mailto:degooglify@proton.com).

## Ladda ner och kör lokalt

1. [Ladda ner projektet som ZIP](https://github.com/Altisdank/degoogleyourself/archive/refs/heads/main.zip) och packa upp filen.
2. Öppna en terminal i mappen `degoogleyourself-main`, där `package.json` finns.
3. Kör `npm start` eller `node server.mjs`. Node.js 20 eller senare behövs.
4. Öppna [http://127.0.0.1:4173](http://127.0.0.1:4173) i webbläsaren.

Inga npm-paket behöver installeras. Avsluta den lokala servern med Ctrl+C.

## Valfri e-postförifyllning med Google

Skapa ett OAuth-klient-ID av typen webbapplikation i Google Cloud. Lägg till den lokala adressen `http://127.0.0.1:4173` som godkänd JavaScript-origin. Klistra in det publika klient-ID:t i meta-taggen `google-oauth-client-id` i `dist/index.html`. Lägg aldrig in någon klienthemlighet.

Bitwarden-flödet läser den verifierade e-postadressen med `openid email` när användaren väljer Google. Uppgiften används för att fylla i Bitwardens inloggning i den valda regionen. Utan klient-ID går det att ange adressen själv. Själva lösenordsimporten godkänns i Bitwardens datorapp.

## Vad fungerar?

- Sex tjänster och tolv alternativ, med officiella källor och 55 kontrollsteg.
- Två tydligt markerade startförslag: Gmail → Proton Mail och Chrome → Firefox. Alla val går att ändra.
- Filtrering, val av leverantör och separata avbockade steg för varje alternativ.
- Planen sparas i webbläsarens lokala lagring. Inget konto behövs.
- Export till läsbar text eller JSON-säkerhetskopia. Import validerar filens innehåll innan användaren ersätter sin lokala plan.
- En förhandsvisad, nedladdningsbar CMD-fil för valda tjänster. Filen frågar före varje installation eller öppnad officiell sida.
- Webbplatsens källkod går att ladda ner som ZIP.
- Responsiv layout, tangentbordsstöd, fokusmarkeringar och minskad rörelse när systemet begär det.

## Vad görs hos leverantörerna?

### Gmail → Proton med namnförslag

Knappen **Byt Gmail till Proton** öppnar ett sammanhållet flöde:

1. Ange din befintliga adress. Friare föreslår samma namn och numrerade alternativ lokalt.
2. Välj ett förslag. **Fortsätt hos Proton** öppnar den officiella registreringen med `plan=free` och det valda adressförslaget förifyllt. Gmail-adressen skickas inte med.
3. Proton kontrollerar ledigheten. Om namnet är upptaget går du tillbaka och väljer **prova nästa nummer**.
4. Lösenord, villkor, verifiering och återställning hanteras direkt hos Proton. Friare tar inte emot något lösenord.
5. Bekräfta själv att kontot fungerar. Först då bockas kontosteget av i din plan. Därefter öppnas Protons Easy Switch för själva importen.

Adressförslag är inte ett besked om ledighet. Friare anropar inte Protons interna kontroll- eller registrerings-API och skapar inte konton i bakgrunden. Förifyllningen bygger på Protons aktuella öppna klientkod och kan ändras; en kopieringsknapp finns som reservväg. Ett redan befintligt Proton-konto kan användas direkt. Adresserna hålls bara i sidans minne och ingår inte i lagrad eller exporterad flyttplan.

Verifiering: [Protons registreringsguide](https://proton.me/support/create-a-free-email-account-address), [namnregler](https://proton.me/support/change-username), [verifiering vid registrering](https://proton.me/support/human-verification), [registreringsparametrar](https://github.com/ProtonMail/WebClients/blob/main/applications/account/src/app/public-app/signup/searchParams.ts).

Friare flyttar inte mejl eller filer själv och tar inte emot lösenord. Gmail-import görs i Protons Easy Switch efter användarens inloggning och medgivande hos tjänsterna. Alla bockar är användarens egna kontroller; länkar eller installationer markerar aldrig en migration som klar.

Gmail-anslutning under övergången innebär att Google-kontot fortfarande används. Kontrollera även återställningsadresser och ”Logga in med Google” innan ett gammalt konto lämnas. Friare tar aldrig bort konton, filer eller program.

Funktioner och abonnemang kan ändras. Källorna i `dist/catalog.js` kontrollerades 2026-11-11. Videon som inspirerade briefen är Zack Shutts ”People Are Actually Leaving Google”. YouTubes automatiska engelska textning lästes: den lyfter Proton Mail, Firefox/Brave, Ente och DuckDuckGo och rekommenderar att börja med ett byte. De konkreta flyttstegen kommer från tjänsternas officiella dokumentation.

## Windows-hjälpen

I webbplatsen: välj tjänster → **Granska din Windows-fil** → granska innehållet → **Hämta CMD-filen**. Öppna filen med Windows. Den använder en fast lista med officiella adresser och paket-ID:n, aldrig fri text från en uppladdad plan.

Installerbara val: Firefox, Brave, Bitwarden och Proton Drive. Övriga alternativ öppnar leverantörens officiella sida efter J/N-fråga. WinGet saknas eller installationen misslyckas: filen visar felet och erbjuder den officiella nedladdningssidan. Inga standardappar ändras och ingen administratörsbehörighet begärs av scriptet; leverantörernas installationsprogram kan visa egna dialoger. Lösenord eller annan kontodata läses inte.

## Kontrollera och uppdatera

```powershell
node --check dist/app.js
node --check dist/catalog.js
node --check dist/downloads.js
node --check dist/state.js
node --test tests/*.test.mjs
```

GitHub skapar nedladdningsfilen från de filer som ingår i grenen `main`.

Friare använder inga externa typsnitt eller analysverktyg. Om e-postförifyllning konfigureras laddar Bitwarden-flödet Googles inloggningsbibliotek. När användaren öppnar en extern tjänst gäller dess villkor.

## Filer

- `dist/index.html`, `dist/styles.css`: gränssnittet.
- `dist/app.js`: interaktioner, guider och nedladdningar.
- `dist/state.js`: validering och beräkning av framsteg.
- `dist/mail-wizard.js`, `dist/mail-wizard.css`: kontoflöde med förifyllning hos Proton och användarens bekräftelse.
- `dist/address-suggestions.js`: lokal validering och numrerade namnförslag.
- `dist/catalog.js`: tjänster och granskade källor.
- `dist/downloads.js`: Windows-hjälpens fasta lista och filgenerator.
- `tests/`: tester för tillstånd och Windows-filer; kör inga installationer.

Licens: MIT, se `LICENSE`. Tjänsternas namn tillhör respektive ägare. Förkortningarna i gränssnittet är navigeringshjälp, inte officiella logotyper.
