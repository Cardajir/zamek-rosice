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
- [x] **CI:** kontrola typů, testy a build na pull requestech a na `main`.
- [x] **Zkušební nasazení** na Cloudflare: https://zamek-rosice.balonhotel-site.workers.dev (`npm run deploy`). Mimo ostrou doménu posílá web `X-Robots-Tag: noindex`, takže se kopie nedostane do vyhledávačů.

## Co ve skořápce a na úvodu chybí

Figma při stavbě neodpovídala na dotaz na detail návrhu (`get_design_context`), fungovaly jen rozměry, texty a snímky. Proto:

- **Logo** je zatím sázené textem. Chybí SVG z Figmy (uzel `4077:1455`).
- **Ornamenty** (ILUSTRACE_01, sedm variant) nejsou.
- **Ikony Facebooku a Instagramu** jsou zástupné, ne exportované z návrhu.
- **Fotky pro úvod** (hero, promo bloky, výzva v patičce) v Sanity nejsou; starý web je neměl. Prohlídky, alba a aktuality fotky mají.
- **Rozestupy** jsou z tokenů Lumos podle snímků, ne změřené hodnotu po hodnotě.
- **Fotka v záhlaví podstránek** (Vstupné, Kde nás najdete, Fotogalerie, Kontakty) není: v Sanity pro ni zatím není pole ani fotka. Stránky začínají lištou a nadpisem.
- **Šířka obsahu** tabulek je šířka webu, návrh má užší sloupec (1312 z 1920 px).
- **Pozadí prohlížeče fotografií** je tmavě fialová z palety; návrh má neutrální tmavě šedou, která v proměnných není.
- **Provozní doba Správy zámku** (v návrhu „v pracovních dnech 7–15“) na stránce není: období provozní doby se váže na prohlídku, pro kancelář v modelu místo není.
- **Pole formuláře** mají viditelný popisek nad linkou (návrh má jen text v poli); kvůli přístupnosti.

## Co potřebuje člověka

1. **Fotky:** nahrát do Studia pro úvod a promo bloky, pro stránku Kde nás najdete a do alb Zámecký exteriér a Edukační centrum (prázdná alba se na webu neukazují). Doplnit alt u 40 fotek ze starého webu a rozdělit fotky mezi Žerotínský a Hausperský okruh.
2. **Instagram:** odkaz do Nastavení webu (Facebook je převzatý ze starého webu).
3. **Písmo Romie:** licence a soubory woff2 (otázka 14). Do té doby záložní patkové písmo.
4. **Viditelnost repozitáře:** je veřejný; doporučení přepnout na soukromý.
5. **Cloudflare:** Worker běží na zkušební adrese; zbývá doména, Turnstile a adresa Workeru v CORS projektu Sanity (jinak se Studio na nasazeném webu nepřihlásí). Secrets `SANITY_API_READ_TOKEN` a `PREVIEW_SECRET` nastavit i ve Workeru.
6. **Odesílání formuláře:** dokud nejsou nastavené `RESEND_API_KEY` a `CONTACT_FROM`, formulář odpoví, že zprávu nejde odeslat. Potřeba je účet u e-mailové služby s ověřenou doménou a cílová adresa v Nastavení webu.
7. **Obsah do Studia:** zřizovatel (Statutární údaje), poznámka k zahradě u období provozní doby, loga partnerů, data u zmínek v médiích.
8. **Designer:** logo a ornamenty jako SVG, chybějící stránky a stavy, schválení barvy štítků `#777080`.
9. **Zámek:** kdo dodá překlady, cílový e-mail formuláře. Ceny 190 / 140 Kč potvrzuje starý web.

## Další implementace

1. **Doladit skořápku a úvod proti Figmě**, až půjde číst detail návrhu: logo, ornamenty, přesné rozestupy, hero fotka.
2. **Page builder:** vykreslení zbylých sedmi sekcí na textových stránkách (zatím jen text).
3. **Skript `i18n:check`** a JSON-LD.
4. **Překlady en a de**, sitemapa s jazyky.
5. **Stránka 404** v češtině a ve vzhledu webu.
6. **Kontroly před spuštěním** a nasazení.

---

[← README](../README.md)
