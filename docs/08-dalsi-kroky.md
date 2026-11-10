# 08 – Další kroky

Stav k 10. 11. 2026. Hotové kroky jsou odškrtnuté.

## Hotovo

- [x] **Revize plánu:** rozpory vyřešené, viz [09-revize.md](09-revize.md) a [decisions.md](decisions.md).
- [x] **Založení projektu:** čistý Lumos for Astro 1.0.3, stack v nejnovějších verzích (rozhodnutí 3).
- [x] **Konfigurace:** adaptér Cloudflare (`output: server`), jazyky cs/en/de, Sanity Studio na `/studio`, náhled přes cookie a middleware, `wrangler.jsonc`.
- [x] **Design tokeny:** barvy, písma a velikosti textu z Figmy v `src/styles/base.css`.
- [x] **Schémata Sanity** včetně struktury Studia.
- [x] **Provozní doba:** `src/utils/opening.ts` s testy.
- [x] **Trasy, slovník, přesměrování:** `src/i18n/`, `src/redirects.ts`.
- [x] **Sanity projekt `fhk95ye1`:** dataset `production` (veřejný), CORS pro localhost a `zamek-rosice.cz`, čtecí token pro náhled v `.dev.vars`.
- [x] **Seed (`npm run seed`):** nastavení, navigace, 9 textových stránek, 8 prohlídek, 6 ceníků, 32 období provozní doby 2026, 10 alb, 3 kontaktní osoby, texty úvodu. Opakované spuštění jen doplní, co chybí. Angličtina a němčina jsou pracovní překlad ke korektuře.
- [x] **Dotazy:** `src/sanity/queries.ts`; chyba nebo prázdný dataset vrátí záložní obsah ze `src/data/`.
- [x] **Skořápka:** navigace se třemi rozbalovacími skupinami, mobilní akordeon, přepínač jazyků, stavová lišta s živým stavem otevření, patička s výzvou.
- [x] **Úvod:** nadpis, nadcházející události, karty prohlídek, hodnocení, tři promo bloky, citace.
- [x] **Migrace obsahu ze starého webu** (`npm run migrate`): stránky, popisy prohlídek, alba, aktuality, partneři, média, dokumenty. Podrobně v [06-migrace-obsahu.md](06-migrace-obsahu.md).
- [x] **Textové stránky:** vykreslují titulek a text s fotkami.
- [x] **Aktuality:** výpis (zvýrazněná, nadcházející, archív) a detail.
- [x] **Prohlídky:** přehled a detail s popisem a fotkami.
- [x] **Přesměrování** starých adres v `src/redirects.ts`.
- [x] **Vstupné a provozní doba:** ceníky z `ticketList`, tabulka hodin složená z `openingPeriod` (`src/utils/hours.ts` s testy). Okruhy se stejnými hodinami sdílí jednu tabulku.
- [x] **Kde nás najdete:** texty z `visitInfo`, odkaz na mapu ze souřadnic v Nastavení webu.
- [x] **Fotogalerie:** úvod s výběrem z každého alba, každé album na vlastní adrese, prohlížeč fotografií (šipky, Esc, tažení prstem, návrat fokusu).
- [x] **Kontakt:** kontakty, osoby a formulář. Endpoint `/api/contact` kontroluje vstup, má past na roboty a volitelně Turnstile.
- [x] **Zámek v médiích, Partneři zámku, Povinné a statutární informace, Mapa stránek.**
- [x] **Poznámky designera k přístupnosti** (sekce „Na co si dát pozor“ ve Figmě) prověřené na 34 stránkách: jeden `h1` na stránku a úrovně nadpisů bez přeskoků (texty z editoru se srovnávají při vykreslení, `src/utils/headings.ts`), žádný odkaz ani tlačítko bez názvu, žádný obrázek bez `alt`, kontrast textu nejméně 4,5 : 1, menu i prohlížeč fotek jdou ovládat klávesnicí s viditelným fokusem.
- [x] **Podklady z Figmy:** logo, šipky odkazů a menu, ikony sítí a sedm ilustrací jsou vyexportované z návrhu (`src/assets/`). Ilustrace jsou na místech, kde je návrh má: úvod (nad nadpisem a nad citací), aktuality, fotogalerie, kontakty, kde nás najdete, vstupné, textové stránky.
- [x] **Navbar podle návrhu:** písmo a rozestupy z Figmy, jazyk v rozbalovací nabídce. Plná lišta je od šířky 1360 px, pod ní menu pod tlačítkem.
- [x] **Úvod podle návrhu:** alternativní litery Romie v hlavním nadpisu, řádky událostí a karty prohlídek ve velikostech a rozestupech z Figmy.
- [x] **Animace při rolování** (`src/components/utility/Reveal.astro`): obsah pod prvním zobrazením se při příjezdu do okna zvedne a rozsvítí, prvky v řadě jdou po sobě. Bez JavaScriptu, při omezeném pohybu v systému a při tisku se nic neskrývá.
- [x] **Stav otevřeno / zavřeno:** zelená tečka při otevřeno, červená při zavřeno. Ve Studiu (Provoz a oznámení) je pole **Mimořádně zavřeno**: den nebo rozsah dnů a důvod. Má přednost před všemi obdobími provozní doby; lišta ukáže „Dnes mimořádně zavřeno“ a stránka Vstupné vypíše nadcházející zavření.
- [x] **CI:** kontrola typů, testy a build na pull requestech a na `main`.
- [x] **Zkušební nasazení** na Cloudflare: https://zamek-rosice.steezy-dev.workers.dev (`npm run deploy`). Mimo ostrou doménu posílá web `X-Robots-Tag: noindex`, takže se kopie nedostane do vyhledávačů.

## Co ve skořápce a na úvodu chybí

Detail návrhu už z Figmy číst jde. Zbývá:

- **Promo bloky, hodnocení, citace a patička** na úvodu jsou postavené podle snímků; hodnotu po hodnotě proti Figmě ještě porovnané nejsou.
- **Světlá ilustrace za hodnocením** je v návrhu jen na mobilu; na webu není.
- **Ilustrace na textových stránkách:** návrh ji má u Návštěvního řádu, web ji dává na všechny textové stránky.
- **Fotky na úvodu** (hlavní, druhá nad hodnocením, šest v promo blocích, výzva v patičce) jsou z Figmy nahrané v Sanity. Výřez širokých fotek řídí bod zájmu, který jde ve Studiu posunout.
- **Fotka v záhlaví podstránek** (Vstupné, Kde nás najdete, Fotogalerie, Kontakty) není: v Sanity pro ni zatím není pole ani fotka. Stránky začínají lištou a nadpisem.
- **Šířka obsahu** tabulek je šířka webu, návrh má užší sloupec (1312 z 1920 px).
- **Pozadí prohlížeče fotografií** je tmavě fialová z palety; návrh má neutrální tmavě šedou, která v proměnných není.
- **Provozní doba Správy zámku** (v návrhu „v pracovních dnech 7–15“) na stránce není: období provozní doby se váže na prohlídku, pro kancelář v modelu místo není.
- **Pole formuláře** mají viditelný popisek nad linkou (návrh má jen text v poli); kvůli přístupnosti.

## Co potřebuje člověka

1. **Fotky:** nahrát do Studia pro stránku Kde nás najdete a do alb Zámecký exteriér a Edukační centrum (prázdná alba se na webu neukazují). Doplnit alt u 40 fotek ze starého webu a rozdělit fotky mezi Žerotínský a Hausperský okruh.
2. **Instagram:** odkaz do Nastavení webu (Facebook je převzatý ze starého webu).
3. **Písmo Romie:** soubory jsou dodané a leží jen lokálně v `src/assets/fonts/` (git je ignoruje, repozitář je veřejný). Build na CI proto běží se záložním patkovým písmem; nasazení z počítače se soubory je má. Zbývá potvrdit webovou licenci pro `zamek-rosice.cz` (otázka 14).
4. **Viditelnost repozitáře:** je veřejný; doporučení přepnout na soukromý.
5. **Cloudflare:** Worker běží na zkušební adrese; zbývá doména, Turnstile a adresa Workeru v CORS projektu Sanity (jinak se Studio na nasazeném webu nepřihlásí). Secrets `SANITY_API_READ_TOKEN` a `PREVIEW_SECRET` nastavit i ve Workeru.
6. **Odesílání formuláře:** dokud nejsou nastavené `RESEND_API_KEY` a `CONTACT_FROM`, formulář odpoví, že zprávu nejde odeslat. Potřeba je účet u e-mailové služby s ověřenou doménou a cílová adresa v Nastavení webu.
7. **Prohlášení o přístupnosti:** ve Studiu je nepublikovaný koncept podle zákona č. 99/2019 Sb. a vzoru EU (stav souladu, nepřístupný obsah, zpětná vazba, DIA). Hranaté závorky označují, co musí zámek doplnit: data, odpovědnou osobu, potvrzení stavu souladu. Zveřejněná stránka má pořád starý text s odkazem na zrušenou vyhlášku č. 64/2008 Sb.
8. **PDF bez textové vrstvy:** „Rozpočet 2025“ je naskenovaný obrázek; ostatní zveřejněná PDF textovou vrstvu mají.
9. **Zpráva o nápravě pro DIA** do datové schránky ve lhůtě z protokolu.
10. **Obsah do Studia:** zřizovatel (Statutární údaje), poznámka k zahradě u období provozní doby, loga partnerů, data u zmínek v médiích.
11. **Designer:** chybějící stránky a stavy, schválení barvy štítků `#777080`.
12. **Zámek:** kdo dodá překlady, cílový e-mail formuláře. Ceny 190 / 140 Kč potvrzuje starý web.

## Další implementace

1. **Doladit skořápku a úvod proti Figmě**, až půjde číst detail návrhu: logo, ornamenty, přesné rozestupy, hero fotka.
2. **Page builder:** vykreslení zbylých sedmi sekcí na textových stránkách (zatím jen text).
3. **Skript `i18n:check`** a JSON-LD.
4. **Překlady en a de**, sitemapa s jazyky.
5. **Stránka 404** v češtině a ve vzhledu webu.
6. **Kontroly před spuštěním** a nasazení.

---

[← README](../README.md)
