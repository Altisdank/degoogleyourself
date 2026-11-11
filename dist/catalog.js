export const reviewedAt = '2026-11-11';

// Content is intentionally explicit about steps performed in each provider's own tools.
export const catalog = [
  {
    id: 'email', category: 'email', name: 'E-post', from: 'Gmail', icon: 'mail',
    description: 'Ta med dina mejl och ge din nya adress en mjuk start.',
    options: [
      {
        id: 'proton-mail', name: 'Proton Mail', tagline: 'En inkorg med en enkel flyttväg', badge: 'Smidig start', kind: 'guided',
        description: 'Easy Switch hjälper dig importera mejl, kontakter och kalendrar. En Gmail-anslutning kan hålla inkommande post igång under bytet.',
        url: 'https://proton.me/mail',
        steps: [
          { id: 'backup', title: 'Spara en kopia först', body: 'Exportera din Gmail via Google Takeout. Kontrollera att alla arkivdelar är nedladdade och går att öppna. Behåll Gmail under flytten.', link: { label: 'Öppna Google Takeout', url: 'https://takeout.google.com/' } },
          { id: 'account', title: 'Ordna ditt Proton-konto', body: 'Skapa eller öppna ditt konto. Kontrollera att lagringsutrymmet räcker och spara återställningsuppgifterna på en trygg plats.', link: { label: 'Öppna Proton Mail', url: 'https://mail.proton.me/' } },
          { id: 'import', title: 'Starta Easy Switch', body: 'I Proton: Settings → All settings → Import via Easy Switch. Välj Google, eller More import options → Google, och välj mejl, kontakter och kalendrar. Granska behörigheterna i Googles eget inloggningsfönster.', link: { label: 'Visa Protons flyttguide', url: 'https://proton.me/support/switch-from-gmail-to-proton' } },
          { id: 'continuity', title: 'Låt ny post följa med', body: 'Om Gmail connection finns på ditt konto kan du skicka och ta emot Gmail i Proton. Annars kan äldre vidarebefordran finnas. Tillgängligheten varierar. Filter som hoppar över Gmail-inkorgen kan göra att post inte följer med.', link: { label: 'Läs om Gmail-anslutningen', url: 'https://proton.me/support/automatic-forwarding-gmail' } },
          { id: 'verify', title: 'Testa och byt adress i din takt', body: 'Granska importens rapport, gamla mejl, bilagor, kontakter och kalender. Kalendern synkroniseras inte löpande av Gmail-anslutningen. Testa ny inkommande post och uppdatera viktiga konton innan du kopplar bort Gmail.', link: { label: 'Kontrollera importstatus', url: 'https://proton.me/support/manage-imports-easy-switch' } },
        ],
        sources: [
          { label: 'Proton: flytta från Gmail', url: 'https://proton.me/support/switch-from-gmail-to-proton' },
          { label: 'Proton: begränsningar och felsökning', url: 'https://proton.me/support/troubleshooting-easy-switch' },
        ],
      },
      {
        id: 'tuta', name: 'Tuta', tagline: 'En ny inkorg med separat import', badge: 'Fler manuella steg', kind: 'guided',
        description: 'E-post med egna appar. Historiska mejl importeras som filer i datorappen; importfunktionen kräver en plan som stöder den.',
        url: 'https://tuta.com/',
        steps: [
          { id: 'backup', title: 'Exportera din Gmail', body: 'Välj Gmail i Google Takeout. Ladda ner alla arkivdelar, packa upp dem och behåll MBOX-filen som säkerhetskopia.', link: { label: 'Öppna Google Takeout', url: 'https://takeout.google.com/' } },
          { id: 'account', title: 'Välj konto och kontrollera importstöd', body: 'Skapa ett Tuta-konto och installera datorappen. Tutas aktuella guide anger att e-postimport kräver Legend eller Unlimited. Kontrollera planens funktioner innan du väljer.', link: { label: 'Se Tutas planer', url: 'https://tuta.com/pricing' } },
          { id: 'import', title: 'Importera mejlfilerna', body: 'I datorappen: Settings → Email import. Välj en målmapp och importera MBOX- eller EML-filerna. Det är en filimport, inte en löpande Gmail-synkronisering.', link: { label: 'Läs Tutas importguide', url: 'https://tuta.com/support/general' } },
          { id: 'forward', title: 'Ta emot post under övergången', body: 'Följ Tutas instruktion för vidarebefordran från Gmail och bekräfta adressen hos Gmail. Kontakter och kalendrar kan flyttas separat via vCard respektive ICS.', link: { label: 'Tutas guide för bytet', url: 'https://tuta.com/support/howto' } },
          { id: 'verify', title: 'Granska resultatet', body: 'Läs Import history och kontrollera eventuella misslyckade mejl. Testa bilagor, kontakter, kalender och ett nytt mejl. Uppdatera dina viktiga konton innan du slutar använda Gmail.', link: { label: 'Se hela Tuta-guiden', url: 'https://tuta.com/blog/how-to-set-up-and-use-tuta-mail' } },
        ],
        sources: [
          { label: 'Tuta: import och kontakter', url: 'https://tuta.com/support/general' },
          { label: 'Tuta: importens plankrav', url: 'https://tuta.com/blog/how-to-set-up-and-use-tuta-mail' },
        ],
      },
    ],
  },
  {
    id: 'browser', category: 'browser', name: 'Webbläsare', from: 'Chrome', icon: 'globe',
    description: 'Ta med bokmärkena och gör en ny webbläsare till din vardag.',
    options: [
      {
        id: 'firefox', name: 'Firefox', tagline: 'En välbekant start utanför Chrome', badge: 'Smidig start', kind: 'install',
        description: 'Importera bokmärken och historik med den inbyggda guiden. På Windows och Linux kräver Chrome-lösenord ett separat steg.',
        url: 'https://www.firefox.com/',
        steps: [
          { id: 'backup', title: 'Spara det du vill ta med', body: 'Spara öppna Chrome-flikar som bokmärken och exportera bokmärkena som HTML från bokmärkeshanteraren. Kontrollera filen och behåll Chrome tills du har testat bytet.' },
          { id: 'install', title: 'Installera Firefox', body: 'Ladda ner Firefox från den officiella webbplatsen eller använd Friares Windows-hjälp. Installation flyttar inte dina konton eller webbläsardata automatiskt.', link: { label: 'Hämta Firefox', url: 'https://www.firefox.com/' } },
          { id: 'import', title: 'Kör Firefox importguide', body: 'Öppna Inställningar och välj Importera data. Välj rätt Chrome-profil samt bokmärken och historik. Följ guiden och kontrollera dina viktigaste sidor.', link: { label: 'Visa Mozillas importguide', url: 'https://support.mozilla.org/en-US/kb/import-bookmarks-google-chrome' } },
          { id: 'passwords', title: 'Flytta lösenorden separat', body: 'På Windows och Linux behövs CSV för Chrome-lösenord. Exportera lokalt i Chrome och importera via Firefox guide, eller välj en lösenordshanterare. CSV är läsbar: radera den efter verifierad import och dela den inte här.', link: { label: 'Läs om lösenordsimport', url: 'https://support.mozilla.org/en-US/kb/import-bookmarks-google-chrome' } },
          { id: 'verify', title: 'Gör Firefox till ditt förstaval', body: 'Testa inloggningar och viktiga webbplatser. Välj Firefox som standardwebbläsare i systemets inställningar och byt standardsökmotor separat. Vissa tillägg behöver installeras på nytt.', link: { label: 'Mozillas bytesguide', url: 'https://support.mozilla.org/en-US/kb/switching-chrome-firefox' } },
        ],
        sources: [
          { label: 'Mozilla: byt från Chrome', url: 'https://support.mozilla.org/en-US/kb/switching-chrome-firefox' },
          { label: 'Mozilla: import och begränsningar', url: 'https://support.mozilla.org/en-US/kb/import-bookmarks-google-chrome' },
        ],
      },
      {
        id: 'brave', name: 'Brave', tagline: 'Bekant känsla och inbyggt skydd', badge: 'Alternativ', kind: 'install',
        description: 'En webbläsare med import av Chrome-bokmärken och inställningar. Lösenorden flyttas separat via en lokal fil.',
        url: 'https://brave.com/download/',
        steps: [
          { id: 'backup', title: 'Spara bokmärken och öppna flikar', body: 'Exportera bokmärken från Chrome till HTML och spara öppna flikar som bokmärken. Kontrollera säkerhetskopian och behåll din gamla Chrome-profil.' },
          { id: 'install', title: 'Installera Brave', body: 'Hämta Brave från dess officiella webbplats eller välj Brave i Friares Windows-hjälp.', link: { label: 'Hämta Brave', url: 'https://brave.com/download/' } },
          { id: 'import', title: 'Importera från Chrome', body: 'I Brave: Menu → Bookmarks → Import Bookmarks and Settings. Välj Chrome-profilen och vilka uppgifter du vill ta med.', link: { label: 'Visa Braves importguide', url: 'https://support.brave.app/hc/en-us/articles/360019782291-How-do-I-import-or-export-browsing-data' } },
          { id: 'passwords', title: 'Ta med lösenorden', body: 'Öppna chrome://password-manager/settings i Chrome och exportera lösenorden. Importera filen i Brave på brave://password-manager/settings. CSV innehåller läsbara lösenord; radera filen efter kontrollerad import.' },
          { id: 'verify', title: 'Testa och välj standard', body: 'Kontrollera bokmärken och inloggningar, och välj Brave som standardwebbläsare i systeminställningarna. Kontrollera även standardsökmotorn. Räkna med att vissa webbplatser kräver ny inloggning.' },
        ],
        sources: [
          { label: 'Brave: import och lösenord', url: 'https://support.brave.app/hc/en-us/articles/360019782291-How-do-I-import-or-export-browsing-data' },
        ],
      },
    ],
  },
  {
    id: 'search', category: 'search', name: 'Sökmotor', from: 'Google Sök', icon: 'search',
    description: 'Ett litet byte som märks vid varje sökning.',
    options: [
      {
        id: 'duckduckgo', name: 'DuckDuckGo', tagline: 'Byt sökning på några steg', badge: 'Enkelt byte', kind: 'guided',
        description: 'Sök från din vanliga webbläsare. Du väljer själv standardsökmotor och testar att bytet fungerar.',
        url: 'https://duckduckgo.com/',
        steps: [
          { id: 'prepare', title: 'Spara dina viktiga sidor', body: 'Bokmärk sidor du vill behålla från tidigare sökningar och notera din nuvarande sökinställning. Ingen historik flyttas automatiskt mellan sökmotorerna.' },
          { id: 'try', title: 'Prova dina vanliga sökningar', body: 'Öppna DuckDuckGo och testa några sökningar du använder ofta. Kontrollera att resultat och språk passar dig.', link: { label: 'Prova DuckDuckGo', url: 'https://duckduckgo.com/' } },
          { id: 'default', title: 'Byt standardsökmotor', body: 'I Firefox: Inställningar → Sök → Standardsökmotor → DuckDuckGo. För andra webbläsare följer du DuckDuckGos instruktioner.', link: { label: 'Välj guide för din webbläsare', url: 'https://duckduckgo.com/duckduckgo-help-pages/change-default-search-engine' } },
          { id: 'verify', title: 'Kontrollera adressfältet', body: 'Öppna en ny flik och skriv en sökning i adressfältet. Kontrollera att DuckDuckGo öppnas. Upprepa inställningen på mobilen och andra webbläsare du använder.' },
        ],
        sources: [
          { label: 'DuckDuckGo: välj standardsökmotor', url: 'https://duckduckgo.com/duckduckgo-help-pages/change-default-search-engine' },
          { label: 'DuckDuckGo: Firefox', url: 'https://duckduckgo.com/duckduckgo-help-pages/change-default-search-engine/firefox' },
        ],
      },
      {
        id: 'brave-search', name: 'Brave Search', tagline: 'Ett annat perspektiv på webben', badge: 'Alternativ', kind: 'guided',
        description: 'En sökmotor som också fungerar utan Brave-webbläsaren. Prova resultat och välj den som standard om den passar.',
        url: 'https://search.brave.com/',
        steps: [
          { id: 'prepare', title: 'Behåll dina sparade sidor', body: 'Bokmärk viktiga sidor och notera din nuvarande sökinställning så att du kan ändra tillbaka. Tidigare Google-sökhistorik importeras inte.' },
          { id: 'try', title: 'Testa Brave Search', body: 'Prova några vardagliga sökningar. Du behöver inte byta till Brave-webbläsaren för att använda söktjänsten.', link: { label: 'Prova Brave Search', url: 'https://search.brave.com/' } },
          { id: 'default', title: 'Välj som standardsökning', body: 'Öppna Brave Searchs guide i den webbläsare du använder och följ dess instruktioner. Inställningen görs i webbläsaren, inte av Friare.', link: { label: 'Visa inställningsguiden', url: 'https://search.brave.com/default' } },
          { id: 'verify', title: 'Kontrollera sökning och region', body: 'Sök från adressfältet i en ny flik. Kontrollera att Brave Search öppnas och välj språk, region och sökfilter efter behov. Gör samma byte på mobilen.', link: { label: 'Öppna sökinställningar', url: 'https://search.brave.com/settings' } },
        ],
        sources: [
          { label: 'Brave Search: kom igång', url: 'https://search.brave.com/help' },
          { label: 'Brave Search: standardsökmotor', url: 'https://search.brave.com/default' },
        ],
      },
    ],
  },
  {
    id: 'drive', category: 'drive', name: 'Filer', from: 'Google Drive', icon: 'cloud',
    description: 'Flytta dokument och mappar till ett nytt hem.',
    options: [
      {
        id: 'proton-drive', name: 'Proton Drive', tagline: 'Filer i samma Proton-konto', badge: 'Smidig start', kind: 'guided',
        description: 'Flytta dina filer via en Takeout-export och ladda upp dem i Proton Drive. Kontrollera dokument och delningar efteråt.',
        url: 'https://proton.me/drive',
        steps: [
          { id: 'backup', title: 'Exportera dina Drive-filer', body: 'Välj Drive i Google Takeout. Kontrollera exportformaten för Google-dokument och ladda ner samtliga arkivdelar. Exporten raderar inget hos Google.', link: { label: 'Öppna Google Takeout', url: 'https://takeout.google.com/' } },
          { id: 'prepare', title: 'Kontrollera plats och kopia', body: 'Öppna några exporterade dokument och kontrollera att de är läsbara. Se till att du har tillräckligt utrymme både lokalt och i Proton Drive. Behåll originalexporten.' },
          { id: 'upload', title: 'Ladda upp mapparna', body: 'Packa upp arkiven. I Proton Drives webbapp kan du dra in filerna eller välja Upload. Datorappen kan också ladda upp dem. Mappstrukturen behålls.', link: { label: 'Öppna Proton Drive', url: 'https://drive.proton.me/' } },
          { id: 'verify', title: 'Kontrollera filer och delningar', body: 'Vänta tills uppladdningen är klar och öppna ett urval dokument. Skapa nya delningslänkar och kontrollera åtkomst med dem du samarbetar med. Gamla Google-länkar byts inte automatiskt.', link: { label: 'Läs hela flyttguiden', url: 'https://proton.me/support/import-files-google-drive' } },
        ],
        sources: [
          { label: 'Proton: flytta från Google Drive', url: 'https://proton.me/support/import-files-google-drive' },
          { label: 'Google: exportera dina data', url: 'https://support.google.com/accounts/answer/3024190?hl=en' },
        ],
      },
      {
        id: 'nextcloud', name: 'Nextcloud', tagline: 'Välj själv var filerna bor', badge: 'Välj leverantör', kind: 'guided',
        description: 'Använd en Nextcloud-leverantör eller en egen server. Utrymme, funktioner och ansvar för backup beror på lösningen du väljer.',
        url: 'https://nextcloud.com/',
        steps: [
          { id: 'backup', title: 'Ta en kopia av Google Drive', body: 'Exportera Drive via Takeout och ladda ner alla delar. Packa upp filerna och kontrollera några dokument innan du börjar flytta.', link: { label: 'Öppna Google Takeout', url: 'https://takeout.google.com/' } },
          { id: 'provider', title: 'Välj var Nextcloud ska köras', body: 'Välj en leverantör som sköter driften eller en egen server som du underhåller. Kontrollera lagringsutrymme, backup och vilka appar som ingår.', link: { label: 'Hitta en Nextcloud-lösning', url: 'https://nextcloud.com/sign-up/' } },
          { id: 'upload', title: 'Ladda upp dina filer', body: 'Logga in på din Nextcloud-adress, öppna Filer och ladda upp de uppackade filerna. För större mängder kan leverantörens datorapp och synkroniseringsguide passa bättre.', link: { label: 'Läs Nextclouds filguide', url: 'https://docs.nextcloud.com/server/latest/user_manual/en/files/access_webgui.html' } },
          { id: 'verify', title: 'Testa åtkomst och samarbete', body: 'Öppna filer från en annan enhet och kontrollera att uppladdningen är klar. Skapa nya delningar. Behåll Takeout-kopian tills dokument, behörigheter och backup fungerar.' },
        ],
        sources: [
          { label: 'Nextcloud: konton och leverantörer', url: 'https://nextcloud.com/sign-up/' },
          { label: 'Nextcloud: hantera filer', url: 'https://docs.nextcloud.com/server/latest/user_manual/en/files/access_webgui.html' },
        ],
      },
    ],
  },
  {
    id: 'passwords', category: 'passwords', name: 'Lösenord', from: 'Google Lösenord', icon: 'key',
    description: 'Ta med inloggningarna och behåll en väg tillbaka.',
    options: [
      {
        id: 'bitwarden', name: 'Bitwarden', tagline: 'Direktimport från Chrome', badge: 'Smidig start', kind: 'install',
        description: 'Datorappen kan läsa in Chrome-lösenord med ditt godkännande. Direktimporten kräver appen från Bitwardens nedladdningssida.',
        url: 'https://bitwarden.com/download/',
        steps: [
          { id: 'prepare', title: 'Behåll din gamla åtkomst', body: 'Kontrollera att du fortfarande kan öppna Googles lösenordshanterare och att viktiga konton har fungerande återställning. Radera inga befintliga lösenord under flytten.' },
          { id: 'account', title: 'Ordna ditt Bitwarden-valv', body: 'Skapa ett konto och spara återställningsuppgifter säkert. Hämta datorappen från Bitwarden; direktimporten stöds inte av appbutiksversioner.', link: { label: 'Hämta Bitwarden', url: 'https://bitwarden.com/download/' } },
          { id: 'import', title: 'Importera från Chrome', body: 'I datorappen: File → Import data. Välj valv och Chrome, sedan Import directly from browser. Välj rätt profil, importera och bekräfta med datorns lösenord.', link: { label: 'Visa direktimportguiden', url: 'https://bitwarden.com/help/import-from-chrome/' } },
          { id: 'verify', title: 'Testa innan du går vidare', body: 'Installera webbläsartillägget och testa några viktiga inloggningar. Återimport kan skapa dubbletter. Om du använde CSV som reservväg, radera den läsbara filen efter kontrollen. Kontrollera passkeys och tvåstegskoder separat.' },
        ],
        sources: [
          { label: 'Bitwarden: import från Chrome', url: 'https://bitwarden.com/help/import-from-chrome/' },
        ],
      },
      {
        id: 'proton-pass', name: 'Proton Pass', tagline: 'Dina inloggningar hos Proton', badge: 'Alternativ', kind: 'guided',
        description: 'Importera Chrome-lösenord genom en lokal CSV-fil. Själva importen gör du i Proton Pass, utan att dela filen med Friare.',
        url: 'https://proton.me/pass',
        steps: [
          { id: 'prepare', title: 'Säkra din återställning', body: 'Kontrollera att viktiga konton har fungerande återställningsvägar. Behåll uppgifterna i Chrome tills du har verifierat den nya lösenordshanteraren.' },
          { id: 'account', title: 'Öppna Proton Pass', body: 'Ordna ett konto och installera det officiella tillägget för din webbläsare. Spara återställningsuppgifterna på en trygg plats.', link: { label: 'Kom igång med Proton Pass', url: 'https://proton.me/support/pass-browser-extension' } },
          { id: 'export', title: 'Exportera Chrome-lösenorden lokalt', body: 'I Chrome: Google Password Manager → Settings → Export passwords → Download file. Filen innehåller läsbara lösenord. Förvara den lokalt och ladda inte upp den till Friare.', link: { label: 'Visa Protons Chrome-guide', url: 'https://proton.me/support/pass-import-chrome' } },
          { id: 'import', title: 'Importera i Proton Pass', body: 'I Proton Pass-tillägget: Navigation → Settings → Import. Välj Chrome och CSV-filen, granska och importera.', link: { label: 'Läs importinstruktionen', url: 'https://proton.me/support/pass-import-chrome' } },
          { id: 'verify', title: 'Testa och radera exportfilen', body: 'Prova flera viktiga inloggningar och autofyllning. Kontrollera passkeys och tvåstegskoder separat. Radera CSV-filen när importen är kontrollerad; radera inte gamla inloggningar innan du kan använda de nya.' },
        ],
        sources: [
          { label: 'Proton Pass: import från Chrome', url: 'https://proton.me/support/pass-import-chrome' },
          { label: 'Proton Pass: webbläsartillägget', url: 'https://proton.me/support/pass-browser-extension' },
        ],
      },
    ],
  },
  {
    id: 'photos', category: 'photos', name: 'Bilder', from: 'Google Foto', icon: 'image',
    description: 'Ta med minnena, albumen och datumen.',
    options: [
      {
        id: 'ente', name: 'Ente Photos', tagline: 'En färdig flyttväg för dina bilder', badge: 'Smidig start', kind: 'guided',
        description: 'Ente har en Takeout-import som läser foton, videor och tillhörande metadata. Kontrollera album, datum och lagringsbehov efter flytten.',
        url: 'https://ente.io/',
        steps: [
          { id: 'backup', title: 'Exportera hela bildbiblioteket', body: 'Välj Google Foto i Takeout och ladda ner alla ZIP-delar. Kontrollera att nedladdningarna är klara och behåll exporten som säkerhetskopia.', link: { label: 'Öppna Google Takeout', url: 'https://takeout.google.com/' } },
          { id: 'prepare', title: 'Samla filer och metadata', body: 'Packa upp alla delar i en gemensam överordnad mapp och behåll albumens undermappar. Bilder och deras JSON-filer behöver finnas tillsammans för att datum ska kunna tolkas.', link: { label: 'Läs Ente-guiden', url: 'https://help-content.ente.io/help/photos/migration/from-google-photos/' } },
          { id: 'import', title: 'Importera med datorappen', body: 'Kontrollera ditt utrymme i Ente. I den aktuella datorappen: Upload → Google takeout. Välj mappen, granska sammanställningen och starta importen.', link: { label: 'Hämta Ente', url: 'https://ente.com/download' } },
          { id: 'verify', title: 'Granska resultat och fel', body: 'Kontrollera misslyckade och överhoppade filer samt några album, datum och videor. Delade album och rörliga bilder kan behöva extra kontroll. Behåll exporten och en separat backup.', link: { label: 'Ente: frågor om flytten', url: 'https://help-content.ente.io/help/photos/faq/migration' } },
          { id: 'mobile', title: 'Välj backup för nya mobilbilder', body: 'Installera Ente på mobilen och välj vilka mappar som ska säkerhetskopieras. Kontrollera att nya bilder laddas upp innan du ändrar den gamla säkerhetskopieringen.' },
        ],
        sources: [
          { label: 'Ente: importera Google Foto', url: 'https://help-content.ente.io/help/photos/migration/from-google-photos/' },
          { label: 'Ente: begränsningar och kontroll', url: 'https://help-content.ente.io/help/photos/faq/migration' },
        ],
      },
      {
        id: 'immich', name: 'Immich', tagline: 'Bildbibliotek på din egen server', badge: 'För vana användare', kind: 'guided',
        description: 'Egen drift ger kontroll över lagringen och kräver att du sköter server, uppdateringar och backup. En separat import tar hand om Takeout.',
        url: 'https://immich.app/',
        steps: [
          { id: 'backup', title: 'Behåll en oberoende bildkopia', body: 'Exportera Google Foto med Takeout och ladda ner samtliga delar. Kontrollera arkiven och behåll en separat säkerhetskopia utanför den planerade Immich-servern.', link: { label: 'Öppna Google Takeout', url: 'https://takeout.google.com/' } },
          { id: 'server', title: 'Ordna din Immich-server', body: 'Följ den officiella installationsguiden. Planera tillräckligt lagringsutrymme, löpande uppdateringar och backup av både bilder och databas. Det här alternativet kräver egen drift.', link: { label: 'Läs Immichs startguide', url: 'https://docs.immich.app/overview/quick-start/' } },
          { id: 'sample', title: 'Prova ett litet urval', body: 'Skapa ditt konto på den egna servern och ladda upp några bilder och en video. Kontrollera att visning, datum och åtkomst från mobilen fungerar innan du flyttar allt.' },
          { id: 'import', title: 'Importera Takeout', body: 'Immich rekommenderar communityverktyget immich-go för Google Takeout. Följ länken från Immichs dokumentation och dess aktuella instruktioner. Friare kör inte serverinstallationen eller importen åt dig.', link: { label: 'Öppna importdokumentationen', url: 'https://docs.immich.app/features/command-line-interface/' } },
          { id: 'verify', title: 'Testa bibliotek och återställning', body: 'Kontrollera album, datum, videor och importfel. Testa din separata backup och återställningsrutin. Aktivera mobilbackup först när servern fungerar och behåll Google-exporten tills allt är verifierat.' },
        ],
        sources: [
          { label: 'Immich: kom igång', url: 'https://docs.immich.app/overview/quick-start/' },
          { label: 'Immich: Takeout och immich-go', url: 'https://docs.immich.app/features/command-line-interface/' },
        ],
      },
    ],
  },
];
