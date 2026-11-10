# 07 – Otevřené otázky

## Otevřené otázky

1. Figma: VYŘEŠENO, přístup funguje a inventura je hotová (sekce Obsah Figmy, Komponenty a Design tokeny). Zbývá dodání chybějících stránek a stavů, viz Chybí ve Figmě.
2. Jazyky: VYŘEŠENO, cs, en, de s plně přeloženým obsahem od spuštění. Zůstává otevřené: kdo překlady dodá (zámek, překladatel, strojový překlad s korekturou) a v jakém termínu.
3. Page builder, nebo kód: VYŘEŠENO, hybrid. Klíčové stránky v Astru, page builder jen pro obecné textové stránky.
4. Program akcí: Figma ho řeší uvnitř Aktualit (Nadcházející události, Archív, Last minute) a na úvodu jako řádky s datem; samostatnou stránku /akce nemá. Potřebuje zámek vlastní typ event (datum od–do, místo, vstupenky, JSON-LD Event), nebo stačí post s druhem Akce a datem?
5. Vstupenky a rezervace: bude online prodej, objednávky skupin, školních výletů a svateb? Dnes jde všechno telefonem a e-mailem; balonhotel má na modul jen prázdný slot.
6. Formulář Napište nám: ponechat (Worker, Cloudflare Turnstile, odesílání e-mailu)? Komu má chodit?
7. Provozní doba: kdo ji bude zadávat a jak často? Stačí období s daty, nebo i výjimky po dnech (svátky, uzavírky, akce, kdy je zahrada zavřená)?
8. Adresy: zachovat staré URL, nebo přejít na navržené kratší a použít přesměrování?
9. Fotogalerie: Figma má jednu stránku s deseti alby a mřížkou (starý web 9 galerií); chceme alba jako samostatné adresy (lepší pro SEO a sdílení), nebo jen přepínač na jedné stránce? Máme práva k fotkám a jak uvádět autorství? Chybí fotky alb Edukační centrum a Výstavní prostory?
10. Historie: ponechat návštěvnické ohlasy a anglické citáty? Přepsat text do kratšího tvaru?
11. Sociální sítě: dnes jen Facebook. Ukazovat na úvodu feed (Facebook, Instagram), nebo jen odkazy?
12. Šenk a svatby: chybí ceník na webu (je v DOCX nebo vůbec). Má být cena veřejná?
13. Údaje a účty: kdo vlastní Cloudflare, Sanity projekt, GitHub, doménu zamek-rosice.cz (zřizovatel Město Rosice, nebo Správa zámku)? DNS v Cloudflare?
14. Značka a písma: ve Figmě je Romie (nadpisy, kurzíva, čísla) a Manrope (text, OFL). Kdo koupil licenci k Romie, je to webová licence a platí pro doménu zamek-rosice.cz? Balonhotelová licence Round Condensed se na Rosice nevztahuje. Potvrdit s designerem (Jakub Maca) a získat licencované soubory woff2.
15. Mapa: Mapy.cz (jako dnes), nebo vložená mapa jiného poskytovatele?
16. Přístupnost: požadovaná úroveň (WCAG 2.1 AA) a pravidelné aktualizace Prohlášení o přístupnosti. Figma obsahuje poznámky TOTO JE POTŘEBA UDĚLAT (strukturované nadpisy, přístupnost), DOPORUČENÍ a INFO OHLEDNĚ AA; jsou pro nás závazné? Světle fialová #9790a0 má kontrast jen 3,1:1 na bílé a pro malé štítky (Aktuality, Akce) nevyhoví, je nutné ji ztmavit nebo štítky zvětšit.
17. Barvy a tokeny: #c20022 (červená akcent), #f4a426 a #43c96b nejsou v proměnných Figmy a #fb00ff vypadá jako ladící barva; potvrdit, které jsou součást značky, a nechat designera přidat proměnné pro rozestupy a text styly.
18. Zbytky šablony: ve všech frames je skupina s Articulat CF a anglickým vzorovým textem (Product & Service Launche, We bridge the gap, Visual Identity) a 10 textů v Inter; nepřebírat, designer má potvrdit, že jsou nepoužité. Podobně IMPACT_DETAIL_IMG3 ve WIREFRAME a text asdsdadasdasdasdasdsada v kartě.
19. Stav Dnes otevřeno 9:00–18:00: má se počítat živě z openingPeriod podle dne (časové pásmo Europe/Prague, výjimky, kdy je zavřeno)? Lišta navíc ukazuje vstupné 180 Kč / 90 Kč, ale stávající web má hlavní okruhy 190 / 140 Kč; které číslo je správné a který ceník se v liště ukáže?
20. Hodnocení 4,7 z Mapy.com: zdroj, kdo ho aktualizuje (ručně v siteSettings, nebo přes API), a jestli má být na webu při změně odkaz na Mapy.com místo Mapy.cz.
21. Ilustrace ILUSTRACE_01 (7 ornamentů) a logo: kdo je autorem a máme práva k vektorům, případně zdrojové SVG od designera.
22. Menu a rozcestníky: Figma má tři rozbalovací skupiny bez rozcestníků a Aktuality pod Akce a pronájmy; v patičce jsou odkazy Pro školy, Zámecká expozice, Kryt civilní ochrany bez jasného cíle. Potvrdit cíle odkazů a že rozcestníkové stránky nebudou. V mobilním menu je u Akce a pronájmy zobrazen obsah Pro návštěvníky (zřejmě vzorová chyba).
23. Chybí mobilní a tabletové frames (detail prohlídky, Kde nás najdete, detail aktuality, kontakty) a přepínač jazyků; požádat designera, nebo odvodit podle existujících mobilních frames a schválit. Interakce a stavy (hover, focus, chyba formuláře) v návrhu nejsou a prototyp je prázdný.

---

[← README](../README.md)
