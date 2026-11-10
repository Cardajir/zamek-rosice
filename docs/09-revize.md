# 09 – Revize plánu (10. 11. 2026)

Plán byl zkontrolován proti Figmě (soubor ZÁMEK ROSICE, stránka WEBDESIGN) a proti referenčnímu repozitáři balonhotel-site. Tento dokument říká, co se našlo a jak se to vyřešilo. Výsledná rozhodnutí jsou v [decisions.md](decisions.md).

## Co sedělo

- Všech 43 uzlů Figmy uvedených v dokumentech na stránce WEBDESIGN existuje, názvy i rozměry souhlasí. `NAV_SCROLLED 4045:3874` je na stránce WIREFRAME a nebyl ověřen.
- Osm komponent a sedm variant ornamentu ve Figmě souhlasí.
- Textové styly H1–H5, BUTTON, C2, PEREX, C2 SEMI BOLD a C2 SERIF souhlasí s proměnnými Figmy.
- Údaje o balonhotel-site (Astro 7, Sanity 6, Lumos 0.0.3, `output: server`, i18n bez předpony pro cs) souhlasí.

## Rozpory v plánu a jejich řešení

| # | Rozpor | Řešení | Kde |
| --- | --- | --- | --- |
| 1 | Typ `event` byl současně „rozhodnutý“, doporučený ke sloučení s `post` i otevřená otázka. Stránka „akce“ byla v klíčových stránkách, ale sitemapa ji doporučovala nezakládat. | Typ `event` ani `/akce` nevzniknou. Akce jsou `post` s `kind: event`. | Rozhodnutí 5 |
| 2 | Úplnost překladů měl hlídat build. Web se ale renderuje na požadavek a publikace v Sanity build nespouští. | Validace ve Studiu, skript `i18n:check`, 404 pro nepřeloženou stránku. Build nic nehlídá. | Rozhodnutí 7 |
| 3 | Povinné tři jazyky by zdržely urgentní aktuality. | Český `post` jde publikovat hned. Provozní oznámení patří do `visitInfo.notices[]`. | Rozhodnutí 7 |
| 4 | `ticketList` a `openingPeriod` (jedna instance) odkazovaly na `tour` a `venue` (dokument na jazyk). Nebylo jasné, na kterou verzi; data by se zadávala třikrát. | Dokument na jazyk jen pro `page` a `post`. Ostatní typy mají lokalizovaná pole. | Rozhodnutí 6 |
| 5 | `openingPeriod` neměl pravidlo přednosti při překryvu, zdroj svátků a začátky prohlídek byly text. | `kind`, přednost výjimky a kratšího rozsahu, svátky z kódu, `startRule` + `startTimes[]`. | Rozhodnutí 8 |
| 6 | Úroveň přístupnosti byla vedena jako otázka. | WCAG 2.1 AA je zákonná povinnost; nálezy auditu jsou akceptační kritéria. | Rozhodnutí 9 |
| 7 | U formuláře chybělo, čím se pošle e-mail; cookie lišta a analytika nebyly zmíněné. | E-mail z Workeru, Turnstile, analytika bez cookies, lišta není potřeba. | Rozhodnutí 10 |
| 8 | Typ pro soubory se jmenoval `document`, což je v Sanity vyhrazený název. | Přejmenováno na `fileDocument`. | [02](02-sanity-model.md) |
| 9 | Přesměrování přes soubor `_redirects`, u Workeru s vlastním renderem nejisté. | Mapa v kódu a middleware. | Rozhodnutí 10 |
| 10 | „Kryt civilní obrany“ i „ochrany“. | Jednotně „obrany“. | Rozhodnutí 11 |

## Co se změnilo ve Figmě

Podrobně v [03-figma-a-komponenty.md](03-figma-a-komponenty.md), oddíl Změny ve Figmě.

- Úvod má sedm karet prohlídek po 370 px ve čtyřech sloupcích (plán: 505 px, tři sloupce).
- Úvod má tři promo bloky: svatba, Šenk, školní výlety (plán: dva).
- Přibyla sekce FONTY a blok v KONTAKTY.
- Mobilní Vstupné a provozní doba je neúplné.
- Info lišta ukazuje „Dnes otevřeno 9:00 – 18:00“ a „180 Kč / 90 Kč“; tabulky ve stejném návrhu mají nejpozději 17:00 a 190 / 140 Kč. Hodnoty v liště jsou vzorové.

## Změna postupu: čistý Lumos místo kopie balonhotel-site

Původní krok „založit repozitář ze šablony balonhotel-site“ je zrušený. Projekt je založený čistou instalací Lumos for Astro 1.0.3. Důvody:

- balonhotel-site běží na Lumos 0.0.3; mezi verzemi se změnila struktura složek i komponenty.
- Odpadá riziko, že se do veřejného repozitáře dostanou hotelové texty, fotky nebo licencované písmo.

Z balonhotel-site se jako vzor přebírá jen způsob napojení: klient Sanity, náhled přes cookie a middleware, pomocné funkce pro jazyky. Kód je napsaný znovu pro tento projekt.

Poznámka k instalátoru: `create-lumos` 0.3.9 na Windows spadne při vytváření symbolických odkazů `.claude/skills/*` (chybí oprávnění, záložní kopie neumí složku). Projekt byl proto založen ze stejného archivu šablony (commit `9f149ee`) a `package.json` orazítkován stejně, jako to dělá instalátor. Složky v `.claude/skills/` jsou kopie `.agents/skills/`.

## Verze

Tabulka je v rozhodnutí 3. TypeScript zůstává na 6.0.3, protože `@astrojs/check` verzi 7 zatím nepodporuje.

## Co nebylo ověřeno

- Stránky WIREFRAME, REFERENCE a OLD ve Figmě.
- Počet barevných proměnných a výskyty barev.
- Údaje o stávajícím WordPress webu (počty stránek, příspěvků, galerií).
- Dostupnost odesílání e-mailů z Workeru pro konkrétní účet Cloudflare.

---

[← README](../README.md)
