# 07 – Otevřené otázky

## Otevřené otázky

Revidováno 10. 11. 2026. Otázky označené VYŘEŠENO mají odpověď v [decisions.md](decisions.md).

1. Figma: VYŘEŠENO, přístup funguje a inventura je hotová (sekce Obsah Figmy, Komponenty a Design tokeny). Zbývá dodání chybějících stránek a stavů, viz Chybí ve Figmě.
2. Jazyky: VYŘEŠENO, cs, en, de s plně přeloženým obsahem od spuštění. Zůstává otevřené: kdo překlady dodá (zámek, překladatel, strojový překlad s korekturou) a v jakém termínu.
3. Page builder, nebo kód: VYŘEŠENO, hybrid. Klíčové stránky v Astru, page builder jen pro obecné textové stránky.
4. Program akcí: VYŘEŠENO (rozhodnutí 5). Akce jsou `post` s druhem Akce a poli akce; typ `event` ani stránka `/akce` nevzniknou.
5. Vstupenky a rezervace: bude online prodej, objednávky skupin, školních výletů a svateb? Dnes jde všechno telefonem a e-mailem; balonhotel má na modul jen prázdný slot.
6. Formulář Napište nám: VYŘEŠENO technicky (rozhodnutí 10): Worker, Turnstile, e-mail z Workeru. Zůstává: komu má chodit a jestli má účet Cloudflare dostupné odesílání e-mailů.
7. Provozní doba: VYŘEŠENO modelem (rozhodnutí 8): období, výjimky po dnech, svátky počítané kódem. Zůstává: kdo ji bude zadávat.
8. Adresy: VYŘEŠENO, navržené kratší adresy a přesměrování 301 starých (rozhodnutí 10).
9. Fotogalerie: Figma má jednu stránku s deseti alby a mřížkou (starý web 9 galerií); chceme alba jako samostatné adresy (lepší pro SEO a sdílení), nebo jen přepínač na jedné stránce? Máme práva k fotkám a jak uvádět autorství? Chybí fotky alb Edukační centrum a Výstavní prostory?
10. Historie: ponechat návštěvnické ohlasy a anglické citáty? Přepsat text do kratšího tvaru?
11. Sociální sítě: dnes jen Facebook. Ukazovat na úvodu feed (Facebook, Instagram), nebo jen odkazy?
12. Šenk a svatby: chybí ceník na webu (je v DOCX nebo vůbec). Má být cena veřejná?
13. Údaje a účty: kdo vlastní Cloudflare, Sanity projekt, GitHub, doménu zamek-rosice.cz (zřizovatel Město Rosice, nebo Správa zámku)? DNS v Cloudflare?
14. Značka a písma: ve Figmě je Romie (nadpisy, kurzíva, čísla) a Manrope (text, OFL). Kdo koupil licenci k Romie, je to webová licence a platí pro doménu zamek-rosice.cz? Balonhotelová licence Round Condensed se na Rosice nevztahuje. Potvrdit s designerem (Jakub Maca) a získat licencované soubory woff2.
    - Nově: repozitář `Cardajir/zamek-rosice` je **veřejný**. Soubory Romie v něm být nesmí. Buď repozitář přepnout na soukromý, nebo písma dodávat při nasazení mimo git. Doporučení: soukromý repozitář.
15. Mapa: Mapy.cz (jako dnes), nebo vložená mapa jiného poskytovatele?
16. Přístupnost: VYŘEŠENO (rozhodnutí 9). WCAG 2.1 AA je povinnost ze zákona č. 99/2019 Sb.; poznámky ve Figmě jsou akceptační kritéria. Zůstává: schválit ztmavení štítků z #9790a0 na #777080.
17. Barvy a tokeny: #c20022 (červená akcent), #f4a426 a #43c96b nejsou v proměnných Figmy a #fb00ff vypadá jako ladící barva; potvrdit, které jsou součást značky, a nechat designera přidat proměnné pro rozestupy a text styly.
18. Zbytky šablony: ve všech frames je skupina s Articulat CF a anglickým vzorovým textem (Product & Service Launche, We bridge the gap, Visual Identity) a 10 textů v Inter; nepřebírat, designer má potvrdit, že jsou nepoužité. Podobně IMPACT_DETAIL_IMG3 ve WIREFRAME a text asdsdadasdasdasdasdsada v kartě.
19. Stav Dnes otevřeno: VYŘEŠENO (rozhodnutí 8). Počítá se živě z `openingPeriod`, pásmo Europe/Prague. Lišta ukazuje ceník s příznakem `showInStatusBar`; hodnoty 180 / 90 Kč a 9:00–18:00 ve Figmě jsou vzorové. Zůstává: potvrdit, že platí 190 / 140 Kč.
20. Hodnocení 4,7 z Mapy.com: zdroj, kdo ho aktualizuje (ručně v siteSettings, nebo přes API), a jestli má být na webu při změně odkaz na Mapy.com místo Mapy.cz.
21. Ilustrace ILUSTRACE_01 (7 ornamentů) a logo: kdo je autorem a máme práva k vektorům, případně zdrojové SVG od designera.
22. Menu a rozcestníky: Figma má tři rozbalovací skupiny bez rozcestníků a Aktuality pod Akce a pronájmy; v patičce jsou odkazy Pro školy, Zámecká expozice, Kryt civilní ochrany bez jasného cíle. Potvrdit cíle odkazů a že rozcestníkové stránky nebudou. V mobilním menu je u Akce a pronájmy zobrazen obsah Pro návštěvníky (zřejmě vzorová chyba).
23. Chybí mobilní a tabletové frames (detail prohlídky, Kde nás najdete, detail aktuality, kontakty) a přepínač jazyků; požádat designera, nebo odvodit podle existujících mobilních frames a schválit. Interakce a stavy (hover, focus, chyba formuláře) v návrhu nejsou a prototyp je prázdný.
24. Nově: mobilní frame Vstupné a provozní doba (4113:21044) je neúplný, končí první skupinou cen. Dokreslit, nebo odvodit z desktopu.
25. Nově: překlad urgentních aktualit. Rozhodnuto, že český příspěvek jde publikovat hned (rozhodnutí 7). Potvrdit, že zámku nevadí, když anglická a německá verze výpisu některé příspěvky nemá.
26. Nově: měření návštěvnosti. Navrženo Cloudflare Web Analytics bez cookies, takže bez cookie lišty. Potvrdit, že zámek nepotřebuje Google Analytics.

---

[← README](../README.md)
