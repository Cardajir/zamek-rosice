# Zámek Rosice – plán nového webu

> **Stav k 10. 11. 2026:** plán prošel revizí ([docs/09-revize.md](docs/09-revize.md)) a projekt je založený. Rozhodnutí jsou v [docs/decisions.md](docs/decisions.md), co je hotové a co následuje, v [docs/08-dalsi-kroky.md](docs/08-dalsi-kroky.md).

## Spuštění

```bash
npm install
npm run dev
```

- `npm run check` – kontrola typů, `npm test` – testy provozní doby a tras, `npm run build` – build pro Cloudflare Worker.
- Sanity: projekt `fhk95ye1`, dataset `production`. Zkopíruj `.env.example` do `.env` a doplň `PUBLIC_SANITY_PROJECT_ID=fhk95ye1`. Bez něj web běží bez CMS a Studio na `/studio` se nezapne.
- Náhled konceptů ze Studia potřebuje `SANITY_API_READ_TOKEN` a `PREVIEW_SECRET` v `.dev.vars` (necommituje se).
- Kontaktní formulář posílá na `/api/contact`. E-mail odejde, až budou nastavené `RESEND_API_KEY` a `CONTACT_FROM`; ochranu Turnstile zapínají `PUBLIC_TURNSTILE_SITE_KEY` a `TURNSTILE_SECRET_KEY`. Cílová adresa je v Sanity (Nastavení webu).
- `npm run seed` – doplní do datasetu výchozí obsah, který v něm chybí; `npm run seed -- --replace` přepíše i to, co mezitím změnila migrace nebo editor.
- `npm run migrate` – převede obsah starého webu zamek-rosice.cz do Sanity; `-- --dry` jen vypíše, co by udělal.
- Pravidla pro stavbu stránek a komponent: [LUMOS.md](LUMOS.md), [AGENTS.md](AGENTS.md).

Zdrojem je plán v podobě Page (canvas) *Zámek Rosice – plán nového webu (Astro, Lumos, Sanity, Cloudflare)*, exportovaný do Markdownu bez ztráty tabulek. Texty jsou česky.

## Přehled projektu

Nový web pro **Správu zámku Rosice, příspěvkovou organizaci** (Žerotínovo náměstí 1, 665 01 Rosice). Nahrazuje stávající WordPress web. Obsah je malý, ale strukturovaný: prohlídkové okruhy a stálé výstavy, ceníky, sezónní provozní doba, pronájmy (svatby, Šenk, výstavy), školní výlety, aktuality a akce, fotogalerie, úřední povinnosti a kontakty. Web poběží ve třech jazycích (cs, en, de) s plně přeloženým obsahem od spuštění.

## Stack

- **Astro** 7.4 s adaptérem Cloudflare (output server, renderuje Cloudflare Worker)
- **Lumos for Astro** 1.0.3, čistá instalace přes `npm create lumos@latest` (pravidla v LUMOS.md; CSS jen v komponentě v `@layer components`, rem místo px)
- **Sanity** 6.22 (Studio na /studio, Presentation tool, náhled přes cookie a middleware)
- **Cloudflare** (Worker s assets, Images binding, DNS)
- Přesné verze a důvod, proč TypeScript zůstává na 6: [docs/decisions.md](docs/decisions.md), rozhodnutí 3

## Reference a odkazy

- Referenční repozitář (jen vzor pro napojení Sanity, náhled a i18n; nic se z něj nekopíruje): [Cardajir/balonhotel-site](https://github.com/Cardajir/balonhotel-site) (soukromý)
- Návrh ve Figmě: https://www.figma.com/design/c6VHN35SszCdkTpCRuWj8l/Z%C3%81MEK-ROSICE?node-id=4075-29
- Stávající web: https://zamek-rosice.cz/ (WordPress, jen česky)

## Index dokumentů

| Soubor | Obsah |
| --- | --- |
| [docs/decisions.md](docs/decisions.md) | Rozhodnutí, která jsou hotová (jazyky, hybridní přístup) |
| [docs/01-sitemap.md](docs/01-sitemap.md) | Navržená sitemapa s ověřeným pokrytím ve Figmě |
| [docs/02-sanity-model.md](docs/02-sanity-model.md) | Obsahový model Sanity, vztahy a bloky page builderu |
| [docs/03-figma-a-komponenty.md](docs/03-figma-a-komponenty.md) | Inventura Figmy, mapování komponent, co ve Figmě chybí |
| [docs/04-design-tokeny.md](docs/04-design-tokeny.md) | Barvy, typografie, rozměry a mapování na Lumos |
| [docs/05-jazyky-a-seo.md](docs/05-jazyky-a-seo.md) | i18n (cs, en, de) a SEO |
| [docs/06-migrace-obsahu.md](docs/06-migrace-obsahu.md) | Stávající web a mapování migrace obsahu |
| [docs/07-otevrene-otazky.md](docs/07-otevrene-otazky.md) | Otevřené otázky |
| [docs/08-dalsi-kroky.md](docs/08-dalsi-kroky.md) | Co je hotové a další kroky |
| [docs/09-revize.md](docs/09-revize.md) | Revize plánu: nalezené rozpory, řešení, změny ve Figmě |

> Oddíly **Souhrn plánu** a **Konvence z balonhotel-site** níže jsou původní zadání z první verze. Kde se liší od [docs/decisions.md](docs/decisions.md), platí rozhodnutí.

## Na co se při revizi zaměřit

- Je hybridní přístup (klíčové stránky v kódu, page builder jen pro obecné textové stránky) proveditelný se stackem balonhotel-site a nezpůsobí dvojí údržbu komponent?
- Je model Sanity (zejména openingPeriod, ticketList, lokalizovaná pole a dokumenty na jazyk) konzistentní a dostatečný pro data, která ukazuje Figma?
- Vyplývá z Figmy něco, co plán opomíjí (menu bez rozcestníků, události v Aktualitách, stav "Dnes otevřeno", lightbox, formulář)?
- Rizika: licence písem (Romie), kontrast světle fialové, chybějící mobilní a tabletové frames, přesměrování starých URL.

## Souhrn plánu

> **INFO: Hlavní zjištění** Figma je nyní přístupná a byla přečtena jen pro čtení (nic se do ní, do GitHubu ani do Sanity nezapisovalo). Obsahuje finální desktopový návrh 1920 px a mobilní 402 px pro 11 stránek a stavů: úvod, prohlídky a jejich detail (jen ukázka), vstupné a provozní dobu, kde nás najdete, návštěvní řád, aktuality s detailem, historii, fotogalerii s prohlížečem, kontakty, navigaci s dropdowny a patičku. Chybí rozcestníky, pronájmy (svatby, Šenk, výstavy, školní výlety), média, partneři, povinné informace, právní stránky, 404 a jazykový přepínač; ty se odvodí ze skořápky. Design je malý systém: dvě písma (Romie, Manrope), 4 barevné proměnné, 8 komponent a žádný prototyp.

- Figma ukazuje, že se sitemapa částečně liší od starého webu: menu má jen tři rozbalovací skupiny bez rozcestníkových stránek, Aktuality leží pod Akce a pronájmy a obsahují i události (Nadcházející události, Archív již proběhlých akcí), v horní liště je Kontakty a Povinné a statutární informace. Rozdíly jsou vedené v tabulce sitemapy a v otevřených otázkách.
- Stávající web je WordPress: 36 stránek, 12 příspěvků, 3 kategorie, jen česky, bez programu akcí a bez online vstupenek. Obsah je malý, ale strukturovaný: prohlídky, ceníky, sezónní provozní doba, pronájmy (svatby, Šenk, výstavy), fotogalerie, povinně zveřejňované dokumenty.
- Rozhodnuto: hybrid. balonhotel-site není page builder, stránky jsou v kódu (.astro) složené z komponent Content* a ve Sanity jsou jen strukturované typy. Pro Rosice zůstávají v kódu klíčové stránky (úvod, prohlídky, provozní doba, ceny, kontakt, aktuality, galerie) se strukturovanými typy ve Sanity, a lehký page builder dostanou jen obecné textové stránky (historie, projekty, pronájmy a budoucí stránky).
- Rozhodnuto: jazyky cs, en, de s plně přeloženým obsahem od spuštění. balonhotel-site má jen routing a helpery (bez přeloženého obsahu a bez jazykového pole ve Sanity), takže model překladů, slugy, hreflang a přepínač se dělají nově. Otevřené zůstává, kdo překlady dodá.
- Provozní doba je nejtěžší datový problém: má sezónní režimy po měsících, konkrétní data v roce a pravidla začátků prohlídek. Navrhuji strukturovaný typ openingPeriod místo textové tabulky, jak to dělá balonhotel (hoursRow jako text).

## Konvence z balonhotel-site

| Oblast | Jak je to v balonhotel-site | Pro Zámek Rosice |
| --- | --- | --- |
| Stack | Astro 7, @astrojs/cloudflare, @astrojs/react, @astrojs/sitemap, @sanity/astro, Sanity 6, Node 22.12+, output: server (renderuje Cloudflare Worker), session vypnuté | Převzít beze změny, vlastní Worker a nový Sanity projekt |
| Lumos | Lumos pro Astro, verze 0.0.3: komponenty Section, ContentWrapper, Heading, Eyebrow, Paragraph, ButtonWrapper; vlastní komponenty se jmenují Content + typ + varianta; CSS jen v komponentě v @layer components, rem místo px, kořenová třída končí _wrap; pravidla v LUMOS.md a AGENTS.md | Dodržovat LUMOS.md; nový obsah řešit variantou existující komponenty, ne novou |
| Stránky | Každá stránka je .astro soubor, který skládá Section a Content* komponenty; texty, které se nemění, jsou v kódu nebo v src/data | Pevné šablony pro úvod, vstupné, kontakt; dynamické šablony pro tour, venue, post, gallery; page builder pro textové stránky |
| Sanity | Typy post, menu, room, hall, faq, instagramPost, siteSettings a blockContent; siteSettings je singleton v Studiu přes documentId; pořadí přes pole order; ceny jako text; dotazy GROQ v src/sanity/queries.ts | Zachovat styl (české názvy v Studiu, anglické názvy polí), singleton přes structure builder |
| Odolnost | Selhaný dotaz se zaloguje a vrátí prázdný výsledek, prázdné CMS ukáže statický záložní obsah, sekce bez dat se nevykreslí (render navázaný na počet) | Převzít stejný wrapper query() |
| Náhled | Presentation tool, /api/preview a /api/preview/disable, cookie, middleware přepíná na drafty se stega; secrety SANITY_API_READ_TOKEN a PREVIEW_SECRET jako secrets Workeru | Převzít, doplnit locations pro nové typy |
| Obrázky | Cloudflare Images binding pro lokální assety, Sanity CDN pro fotky z CMS, remotePatterns pro cdn.sanity.io, Img dostane rozměry z dotazu | Převzít; v dotazu vždy vracet width, height, alt |
| Jazyky | i18n v astro.config (cs bez předpony, en a de s předponou), helpery langFromPath, localizedPath, alternates; žádné pages pro en a de, žádné jazykové pole ve Sanity | Plně přeložený obsah cs, en, de od začátku, viz sekce Jazyky |
| SEO | BaseHead: title, description, canonical, robots, OG a Twitter, JSON-LD graf (Hotel, WebSite, BreadcrumbList + schema stránky), NOINDEX_ROUTES, sitemap bez noindex stránek; meta texty jsou v kódu stránek, ne ve Sanity | Přidat objekt seo do Sanity a typy schématu pro zámek |
| Nasazení | wrangler.jsonc, Worker s assets z dist, nodejs_compat, observability; deploy přes wrangler nebo propojení GitHubu s Cloudflare | Nový Worker, vlastní doména v Cloudflare DNS |
| Nástroje | Skripty pro seed (dummy- ID a --undo), screenshoty, kontrolu přetékání, a11y navigace, měření proti Figmě; skills pro Lumos (import z Figmy, audit props) | Převzít skripty a skill lumos-import-figma |

> **POZOR** Písmo Round Condensed je v balonhotel-site licencováno jen pro web hotelu (Fontspring) a repozitář je soukromý. Do nového repa se soubory písem kopírovat nesmí; Figma Rosic používá Romie a Manrope, jejich licence a zdroj souborů je třeba vyřešit zvlášť (viz Design tokeny).
