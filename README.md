# DeGoogleYourself

Friares fristående projekt för GitHub. Packa upp ZIP-filen och lägg innehållet i ett eget repo, exempelvis `degoogleyourself`. Inga tidigare Git-repon eller Sites-inställningar ingår.

## Publicera

- **GitHub Pages:** Ladda upp hela projektet till grenen `main`. Under **Settings → Pages → Build and deployment** väljer du **GitHub Actions**. Det medföljande arbetsflödet publicerar `dist/`.
- **Cloudflare Pages:** Anslut repot eller ladda upp `dist/` som statiska filer. Prova projektnamnet `degoogleyourself` för en gratis `pages.dev`-adress. Cloudflare bekräftar namnet när projektet skapas.

## Valfri e-postförifyllning med Google

Skapa ett OAuth-klient-ID av typen webbapplikation i Google Cloud. Lägg till webbplatsens origin (protokoll och värd utan sökväg) som godkänd JavaScript-origin. Klistra in det publika klient-ID:t i meta-taggen `google-oauth-client-id` i `dist/index.html`. Lägg aldrig in någon klienthemlighet.

Bitwarden-flödet läser den verifierade e-postadressen med `openid email` när användaren väljer Google. Uppgiften används för att fylla i Bitwardens inloggning i den valda regionen. Utan klient-ID går det att ange adressen själv. Själva lösenordsimporten godkänns i Bitwardens datorapp.

# Friare

En svensk webbplats för att byta från Google i sin egen takt. Välj alternativ till Gmail, Chrome, Google Sök, Drive, Googles lösenordshanterare och Google Foto. Friare skapar en lokal flyttplan med officiella guider och en valbar Windows-hjälp.

## Starta lokalt

Kräver Node.js 20 eller senare. Inga paket behöver installeras.

```powershell
cd friare
node server.mjs
```

Öppna http://127.0.0.1:4173. Om du redan står i projektmappen behövs inte `cd friare`. Modulerna behöver en webbserver; dubbelklicka inte på `index.html`.

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
python scripts/package_source.py
```

Kör paketeringen efter källändringar för att uppdatera den nedladdningsbara ZIP-filen. ZIP-filen utesluter Git, hostingidentitet, lokala inställningar, tidigare arkiv och personliga flyttplaner.

Friare använder inga externa typsnitt eller analysverktyg. Om e-postförifyllning konfigureras laddar Bitwarden-flödet Googles inloggningsbibliotek. Driftleverantören kan hantera vanliga anslutningsloggar. När användaren öppnar en extern tjänst gäller dess villkor.

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
