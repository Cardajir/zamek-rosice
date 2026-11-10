# 06 – Stávající web a migrace obsahu

## Stávající web: co obsahuje

| Oblast | Co tam je | Poznámka k novému webu |
| --- | --- | --- |
| Platforma | WordPress (wp-content, sitemap po typech), 36 stránek, 12 příspěvků, kategorie Akce, Aktuality, Homepage | URL příspěvků mají tvar /rok/měsíc/slug/ |
| Jazyky | Pouze česky (jediná angličtina je citát návštěvníka v Historii) | Projekt IROP počítá s jazykovými mutacemi |
| Prohlídky | Okruh Žerotínský, okruh Hausperský (oba cca 60 min), Meda a Jan Mládek (30–40 min), Kryt CO (45 min), Stálá výstava hraček (30–40 min, cca 3000 kusů), Dětský okruh (jen červenec a srpen), Výstava rosického skla (závěr Žerotínského okruhu), Zámecká zahrada (vstup volný) | Zámecké expozice jsou dnes jedna stránka pro dva okruhy; navrhuji dvě samostatné prohlídky |
| Vstupné | Pět ceníků: hlavní okruhy 190/140, rodinné 590, kombinované 340/240, skupiny 70, 170/120; Kryt CO 100/80/60; hračky a dětský okruh 90/70/50; Mládek 110/70; focení 50; pronájem zahrady 150 Kč za hodinu | Ceny jako čísla, aby šly zobrazit i do strukturovaných dat |
| Provozní doba | Po měsících (březen jen 28.–29. 3., duben víkendy a svátky, květen–září denně, říjen víkendy), časy 9–17 nebo 10–16, poslední prohlídka o hodinu dřív; pro každou atrakci zvlášť; zahrada duben–říjen | Obsahuje konkrétní data 2026, každý rok se přepisuje |
| Pronájmy | Svatby (Hudební sál 120–140 osob, Habsburský salonek cca 30, kaple cca 12–14, zahrada), Společenský prostor Šenk (do 60 osob, ne listopad–duben), výstavní prostory (Výstavní síň, Galerie Šatlava, Sklepní galerie) | Objednávka a ceník svateb je DOCX ke stažení; ceník Šenku v textu není |
| Školní výlety | Program pro 1.–4. třídy, 290 Kč na dítě, 15. 5.–28. 6., parkování autobusů zdarma | Obsah je v příspěvku z roku 2023 i na stránce |
| Fotogalerie | 9 galerií, cca 125 fotek s popisky a autorstvím (fotoarchiv Správy zámku, Aleš Palek) | Potřeba pole autor / licence |
| O zámku | Z historie (cca 16 000 znaků včetně návštěvnických ohlasů), Zámek v médiích (cca 10 odkazů a videí), Partneři zámku (6) | – |
| Úřední povinnosti | Statutární informace (název, sídlo, IČ, účet), 7 PDF, Povinná publicita projektů (3 dotované projekty), Ochrana osobních údajů, Prohlášení o přístupnosti, Návštěvní řád, Mapa stránek | Zůstávají povinně |
| Kontakt | Správa zámku Rosice p. o., Žerotínovo náměstí 1, 665 01 Rosice, +420 546 412 891, +420 606 683 229, info@zamek.rosice.cz, Facebook, 3 kontaktní osoby, formulář s kontrolní otázkou | Formulář vyžaduje backend (Worker, Turnstile) |
| Příjezd | GPS 49.182445, 16.386256, auto (D1, parkoviště), vlak (cca 15 min pěšky), autobus (zastávky Trávníky, Brněnská, Husova) | Do visitInfo |

Provozní doba dnes: Hausperský okruh začíná vždy v lichou hodinu, Žerotínský v sudou. Dětský okruh jede v červenci a srpnu v 10, 12 a 14 hodin. Výstava hraček má v létě začátky v 9, 11, 13 a 15 hodin. Zahrada je od dubna do října v pracovní dny 8–17, o víkendech a svátcích 10–17, jinak zavřeno. Model openingPeriod musí tyto případy unést bez textových hacků.

## Migrace obsahu

| Starý obsah | Nový typ | Rozsah | Poznámka |
| --- | --- | --- | --- |
| Úvodní stránka (úvodní text, výpis příspěvků) | homePage + post | 1 + 12 | Text hero z úvodu: Žerotínské renesanční perly nedaleko od Brna |
| Vstupné a provozní doba | ticketList, openingPeriod | 5 ceníků, cca 25 období | Data jsou pro rok 2026; seed naplnit jako výchozí, hodiny doplnit po dohodě |
| Prohlídkové okruhy a podstránky (expozice, Mládek, hračky, Kryt CO, zahrada, sklo) | tour | 7 až 8 | Zámecké expozice rozdělit na Žerotínský a Hausperský okruh |
| Svatby, Šenk, Výstavy | page + venue | 3 stránky, 8 prostorů | Hudební sál, zahrada, kaple, Habsburský salonek, Šenk, Výstavní síň, Galerie Šatlava, Sklepní galerie |
| Objednávka a ceník svateb (DOCX) | document | 1 | Ceny v dokumentu převést do ticketList, jinak nelze zobrazit na webu |
| Školní výlety + příspěvek z 2023 | page + ticketList | 1 + 1 | 290 Kč na dítě, 15. 5.–28. 6., aktualizovat termíny |
| Příspěvky (kategorie Aktuality, Akce, Homepage) | post (a event) | 12 | Příspěvek bez textu (Meda a Jan Mládek 2024) doplnit nebo vyřadit; Výstava betlémů od 5. 12. 2026 je kandidát na event |
| Z historie | page (timeline) | 1 | Text cca 16 000 znaků; návštěvnické ohlasy rozhodnout, zda nechat |
| Zámek v médiích | mediaMention | cca 10 | YouTube embedy a odkazy na ČT, iDNES, Stream, podcast ANOPA |
| Partneři zámku | partner | 6 | Chybí loga, doplnit |
| Fotogalerie | gallery | 9 galerií, cca 125 fotek | Přenést popisky a autorství (c) fotoarchiv Správy zámku, Aleš Palek; chybí alt texty |
| Kontakt a kontaktní osoby | siteSettings, person | 1 + 3 | Vaverka (kastelán), Koubková (zástupkyně, ekonomka), Durkajová (správkyně sbírkových fondů) |
| Statutární informace | document, siteSettings | 7 PDF | Závěrečné zprávy 2019–2022, rozpočet 2025, výhledy 2023–2025 a 2026–2027 |
| Povinná publicita projektů | project | 3 | IROP 2× a OPŽP; musí zůstat s původními údaji |
| Právní stránky (GDPR, přístupnost, návštěvní řád) | page | 3 | Převzít text, ověřit aktuálnost |
| Kde nás najdete | page + visitInfo | 1 | GPS, auto, vlak, autobus, odkaz na Mapy.cz |
| Překlady | všechny přeložitelné typy | cs → en, de | Migrace nahraje češtinu; překlady se doplní ve Studiu (kdo je dodá, je otevřené). Build kontroluje, že každý publikovaný český dokument má en a de |
| Přesměrování | soubor _redirects nebo Worker | cca 50 adres | Včetně /rok/měsíc/slug/ na /aktuality/slug |
| Média (wp-content/uploads) | Sanity assets | stovky souborů | Skript stáhne z WordPressu a nahraje přes Sanity API, ID s předponou kvůli --undo jako v seed-sanity.mjs |

---

[← README](../README.md)
