# 04 – Design tokeny

## Design tokeny

> **INFO: Co Figma opravdu definuje** Jedna kolekce proměnných se čtyřmi barvami (výchozí režim Mode 1), cca 25 textových stylů (desktop a mobil), žádné barevné styly, žádné efekty a žádné proměnné pro rozestupy. Rozměry a další barvy jsou jen změřené z návrhu.

| Barva | Hodnota | Figma | Použití | Kontrast na bílé | Token v Lumos (návrh) |
| --- | --- | --- | --- | --- | --- |
| Tmavě fialová | #2c203c | proměnná DARK VIOLET | Hlavní text, linky, logo (10 238 výskytů) | 15,2:1 | --color-ink |
| Světle šedá | #f0f0f0 | proměnná LIGHT GRAY | Světlé plochy a ornamenty (6 355 výskytů) | – (plocha) | --color-surface |
| Tmavě modrá | #2d3e4d | proměnná DARK BLUE | Doplňkový tmavý tón (175) | 11,0:1 | --color-ink-alt |
| Světle fialová | #9790a0 | proměnná LIGHT PURPLE | Štítky, neaktivní text (163) | 3,1:1, nesplňuje AA pro malý text | jen velký text a dekorace; pro malé štítky `--muted-text` #777080 (4,8:1), ke schválení |
| Červená | #c20022 | jen fill, bez proměnné | Odkazy, aktivní album, Odeslat (300) | 6,3:1 | --color-accent |
| Žlutá | #f4a426 | jen fill | Použití nejasné (50) | 2,1:1 | nepřebírat, ověřit |
| Zelená | #43c96b | jen fill | Tečka Dnes otevřeno (15) | 2,1:1, jen doplněk textu | --color-status-open |
| Purpurová | #fb00ff | jen fill | Pravděpodobně ladící barva (8) | – | nepřebírat |
| Bílá a černá | #fff, #000 (i s průhledností) | jen fill | Pozadí, text na fotkách a v prohlížeči | – | --color-bg, --color-bg-inverse |

Počty výskytů jsou nafouknuté stovkami vektorů ornamentů, ber je jako pořadí důležitosti, ne jako přesné použití. Názvy tokenů jsou návrh, výsledné proměnné v base.css se vytvoří importem z Figmy.

| Styl | Písmo | Desktop | Mobil | rem (desktop / mobil) |
| --- | --- | --- | --- | --- |
| H1 | Romie Medium, velká písmena | 100 px, řádek 104 %, rozestup −2 % | 37 px | 6,25 / 2,3125 |
| H2 | Romie Medium | 64 px, 110 %, −2 % | 26 px | 4 / 1,625 |
| H3 | Romie Medium | 44 px | 20 px kurzíva | 2,75 / 1,25 |
| H4 | Romie Medium | 37 px | 20 px | 2,3125 / 1,25 |
| H5 | Romie Medium kurzíva | 30 px | bez mobilní varianty | 1,875 |
| H6 | Romie Medium | 28 px | bez mobilní varianty | 1,75 |
| NAV | Romie Medium | 48 px | bez mobilní varianty | 3 |
| C2 SERIF | Romie | 20 px, 110 %, −1 % | 16 px | 1,25 / 1 |
| BUTTON | Romie Medium kurzíva | 24 px, 120 %, −1 % | bez mobilní varianty | 1,5 |
| C1 | Manrope | 20 px, 155 %, +2 % | 14 px | 1,25 / 0,875 |
| C2 | Manrope | 18 px a 16 px, 140 %, +2 % | 16 px a 14 px | 1,125 a 1 / 1 a 0,875 |
| PEREX | Manrope Medium | 18 px, 120 %, +2 % | 14 px | 1,125 / 0,875 |
| C2 SEMI BOLD | Manrope SemiBold | 18 px, 120 %, −1 % | 12 px | 1,125 / 0,75 |

| Rozměr | Hodnota (z návrhu) | Poznámka |
| --- | --- | --- |
| Desktop plocha | 1920 px | Jediný desktopový rozměr, žádný tablet |
| Obsahový kontejner | 1643 px (okraj cca 139 px), nav 1647 px | Odpovídá cca 85,6 % plochy; v rem cca 102,7 |
| Sloupec textu | 1312 px (tabulky, detaily, seznamy) a 1220 px (středové nadpisy, citace, galerie) | Dvě max-width |
| Karty prohlídek (úvod) | 370 px, čtyři sloupce, mezera 34 px | Změřeno z uzlů 4144:13652, 13664, 13676, 13688 |
| Promo bloky (úvod) | 505 px sloupec textu | Tři bloky pod sebou |
| Dlaždice galerie | 423×392 px | Poměr cca 1,08 |
| Nav | 111 px výška | Pod ní 1px linka |
| Mobil | 402 px plocha, 370 px obsah (okraj 16 px) | Interpolace mezi 402 a 1920 px |

- Lumos 1.0.3: tokeny jsou v `src/styles/base.css`. Fluidní rozsah je nastavený na 402–1920 px (`--viewport-min`, `--viewport-max`), velikosti textu mají dvojici `-min` / `-max` podle tabulky výše. Všechny rozměry v rem, žádné px.
- Textové styly jako třídy nebo mixiny počínaje H1 až H6, C1, C2, PEREX, BUTTON, NAV; nadpisy se v HTML určují sémanticky (h1 až h6) a vzhled třídou, jak požaduje poznámka ve Figmě o strukturovaných nadpisech.
- Section: světlý motiv (bílé pozadí, text #2c203c) pro většinu stran, tmavý motiv pro prohlížeč a text přes fotku (CTA, hero podstránek).
- Značka: logo Zámek Rosice je vektor v NAV (Vrstva_1) a monogram RZ v patičce; oba exportovat jako SVG a uložit do assets, ne do Sanity.
- Ilustrace: sedm ornamentů ILUSTRACE_01 exportovat jako SVG (nebo jako komponentu s variantou), vektorový původ je ve Figmě pojmenován stSlRD.tif (nejspíš vektorizovaná předloha).
- Písma: Manrope (OFL) se stahuje při buildu přes Astro fonts z Fontsource a servíruje se z vlastní domény. Romie je komerční: soubory `romie-medium.woff2` a `romie-medium-italic.woff2` se do repozitáře **necommitují** (repozitář je veřejný); když ve `src/assets/fonts/` nejsou, build běží na záložním patkovém písmu. Licenci a způsob dodání souborů při nasazení je třeba vyřešit (otázka 14).

---

[← README](../README.md)
