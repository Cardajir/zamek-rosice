# 03 – Figma: inventura a komponenty

Inventura ověřena znovu 10. 11. 2026 proti souboru (stránka WEBDESIGN). Všechny uvedené uzly existují a rozměry souhlasí. Co se v návrhu od první inventury změnilo, je v oddílu Změny ve Figmě k 10. 11. 2026.

Figma soubor: https://www.figma.com/design/c6VHN35SszCdkTpCRuWj8l/Z%C3%81MEK-ROSICE?node-id=4075-29

## Obsah Figmy

- **Soubor**: ZÁMEK ROSICE, fileKey c6VHN35SszCdkTpCRuWj8l, výchozí uzel WEBDESIGN 4075:29; autor designu Jakub Maca (podle patičky „Design by Jakub Maca, 2026“)
- **Přístup**: Funguje, čteno jen přes get_metadata, get_screenshot, get_variable_defs a čtecí skripty; do Figmy se nezapisovalo
- **Stránky souboru**: WEBDESIGN (4075:29): finální návrh. WIREFRAME (31:3): starší drátěný model s variantami úvodu, NAV_SCROLLED a šablonovým zbytkem IMPACT_DETAIL_IMG3. REFERENCE (0:1): jen seznam studií jako inspirace. OLD (4091:34513): staré verze Fotografií a Kontaktů
- **Poznámky v návrhu**: Sekce „NA CO SI DÁT POZOR OD AI“ (4075:30): TOTO JE POTŘEBA UDĚLAT (strukturované nadpisy h1 a níže, přístupnost pro handicapované, položky k probrání s klientem), DOPORUČENÍ a INFO OHLEDNĚ AA (WCAG kontrast a úroveň AA)
- **Prototyp a interakce**: Žádné reakce ani přechody (0 reakcí). Jsou jen statické stavy: tři rozbalené stavy navigace, NAV_SCROLLED (wireframe), prohlížeč fotografií na šířku a na výšku, rozbalené mobilní menu, aktivní položka v galerii (červené podtržení)
- **Breakpointy**: Jen desktop 1920 px a mobil 402 px; tablet neexistuje
- **Písma**: Romie (Medium, Medium Italic) pro nadpisy, odkazy a velká čísla; Manrope (Regular, Medium, SemiBold, Bold) pro text. Articulat CF (96 textů) a Inter (10 textů) jsou jen zbytky šablony, viz otevřené otázky

| Frame (desktop 1920 px) | Uzel | Výška px | Mobilní verze (402 px) |
| --- | --- | --- | --- |
| HOMEPAGE | 4077:86 | 13261 | HOMEPAGE – MOBILE 4096:43693 |
| PROHLÍDKOVÉ OKRUHY | 4081:5384 | 8505 | 4113:18187 |
| PROHLÍDKOVÉ OKRUHY (DETAIL), příklad Žerotínský okruh | 4088:23922 | 5751 | chybí |
| KDE NÁS NAJDETE | 4085:7124 | 4580 | chybí |
| VSTUPNÉ A PROVOZNÍ DOBA | 4085:7373 | 9499 | 4113:21044 (**neúplný:** 1850 px, jen první skupina cen, bez hodin) |
| NÁVŠTĚVNÍ ŘÁD | 4085:7440 | 4950 | 4113:21552 (v souboru chybně pojmenovaný VSTUPNÉ A PROVOZNÍ DOBA – MOBILE) |
| AKTUALITY | 4088:23677 | 8194 | 4113:22557 |
| AKTUALITY (DETAIL) | 4090:28531 | 3071 | chybí |
| Z HISTORIE | 4090:29009 | 3786 | 4120:23924 |
| FOTOGALERIE | 4091:33751 | 7135 | 4120:24845, 4120:26402, 4120:29415 (poslední s prohlížečem) |
| PROHLÍŽEČ FOTOGRAFII (na šířku, na výšku) | 4091:35262, 4091:35672 | 1054 | součást 4120:29415 |
| KONTAKTY (s formulářem) | 4094:40133 | 3575 | chybí |
| NAV BAR 1 Pro návštěvníky, NAV BAR 2 Akce a pronájmy, NAV BAR 3 O zámku | 4081:1011, 4081:2446, 4081:3890 | 1269 | NAV – MOBILE 4113:14031 |
| TEXT STYLES, TEXT STYLES – MOBILE, COMPONENTS_DESKTOP | 4075:2751, 4113:19619, 4077:1404 | – | – |

Menu ve Figmě: Pro návštěvníky (Prohlídkové okruhy, Kde nás najdete, Vstupné a provozní doba, Návštěvní řád), Akce a pronájmy (Aktuality, Svatby, Školní výlety, Výstavy, Pronájem společenského prostoru Šenk), O zámku (Z historie, Zámek v médiích, Partneři zámku, Fotogalerie). Vpravo v liště jsou Kontakty, Povinné a statutární informace a ikony Facebooku a Instagramu. Patička má tři sloupce odkazů (Úvodní stránka, Akce a pronájmy, O zámku, Kontakty; Svatba na zámku, Pronájem šenku, Pro školy, Zámecká expozice, Kryt civilní ochrany; Povinné a statutární informace, Povinná publicita projektů, Prohlášení o přístupnosti, Ochrana osobních údajů), údaje Správy zámku, telefony a e-mail velkým písmem a loga RZ, Objevuj památky, kudyznudy.cz a Rosice.

Úvod ve Figmě: lišta s cenou vstupného, adresou a stavem Dnes otevřeno s hodinami, ornament, velký nadpis, odkaz na historii, seznam Nadcházející události, sekce Prohlídkové okruhy a stálé výstavy (sedm karet po 370 px ve čtyřech sloupcích), hodnocení z Mapy.com (4,7), tři promo bloky (svatba, Šenk, školní výlety), citace a CTA Máte dotaz. Aktuality obsahují sekce Nadcházející události, Archív již proběhlých akcí a Last minute sezóny 2026, takže akce žijí uvnitř aktualit.

## Komponenty z Figmy a mapování

Figma nemá komponentovou knihovnu: jsou v ní jen osm komponent (NAV, MENU BUTTON, tlačítko, karta, řádek události, ILUSTRACE_01 a dvě patičky). Ostatní bloky jsou ručně nakreslené skupiny. Tabulka je spojuje s komponentami Lumos a s typem realizace (kód nebo sekce page builderu).

| Prvek ve Figmě | Uzel a velikost | Obsah a varianty | Komponenta a realizace | Data ve Sanity |
| --- | --- | --- | --- | --- |
| NAV | 4077:1524, 1920×111; MENU BUTTON 4077:1505 | Vlevo tři rozbalovací tlačítka, uprostřed logo (vektor), vpravo Kontakty, Povinné a statutární informace, Facebook, Instagram, pod tím tenká linka. Tři rozbalené stavy (NAV BAR 1 až 3): celý panel s řádky velkým písmem Romie, šipkou a dělící linkou, pod nimi fotka a info lišta. Mobil NAV – MOBILE: haršikulka, zavírátko, akordeón s třemi skupinami. Wireframe naví NAV_SCROLLED 4045:3874 (zmenšená verze po rolování) | Nav + dropdown; kód, klientský skript (aria-expanded, Esc, focus) | navigation (menu, horní lišta, sociální sítě) |
| Info lišta | v každém frame pod navem, cca 1647×60 | Vlevo Základní / zvýhodněné vstupné (180 Kč / 90 Kč), uprostřed adresa, vpravo zelená tečka Dnes otevřeno 9:00–18:00 | Nová komponenta StatusBar; kód, živý výpočet ze dne (`src/utils/opening.ts`). Hodnoty ve Figmě jsou vzorové: hodiny nikde nekončí v 18:00 a ceník má 190 / 140 Kč | siteSettings, ticketList, openingPeriod |
| Hero (Úvod) | 4077:4212, 1220×743 | Ornament ILUSTRACE_01, obrovský nadpis Romie velkými písmeny, odkaz více o historii; u podstránek fotka se středovým nadpisem (KONTAKTY) | ContentHeroMain; kód (Úvod), sekce hero (page builder) | homePage, page.hero |
| Tlačítko a odkaz (Frame 11958) | 4077:26, 176×29, cca 120 instancí | Šipka a text kurzívou Romie, červená varianta (všechny akce, čtete více, Odeslat) | Button / ButtonWrapper, varianta link | link, cta |
| ILUSTRACE_01 | 4079:5181, 7 variant (Property 1: 1 až 7), 124×72 | Vektorový ornament nad nadpisy, citací a ve velké světlé podobě na Kontaktech | Nová komponenta Ornament s prop variant 1 až 7 (inline SVG) | výběr varianty v sekci |
| Karta prohlídky (úvod) | Frame 11993 4144:13652 a další, 370×649 | Fotka, štítek s délkou, nadpis, perex, odkaz; sedm karet ve čtyřech sloupcích | Card; kód | tour (`showOnHome`, pořadí) |
| Promo blok (úvod) | Frame 11996 4077:4442, 505×836; bloky 4079:4679, 4144:15102, 4079:4692 | Štítek, nadpis, fotky, text, odkaz; tři bloky: svatba, Šenk, školní výlety | Nová komponenta PromoMain; kód | homePage.promos[] |
| Řádek prohlídky (seznam) | Frame 12019 a další, řádky 1312×613 | Fotka 505×613 a text, střídavě vlevo a vpravo; štítek Doba prohlídky, nadpis, perex, tlačítko | ContentProgrammeMain varianta alt; kód | tour (strana obrázku podle pořadí) |
| Řádek události a aktuality | Frame 11985 4077:4269, 1643×297 | Plakát 177×223, štítek Aktuality nebo Akce, nadpis, text, vpravo rok a velké datum, linka mezi řádky | CardNews a CardProgram; sekce news a events | post (`kind`) |
| Ceník a hodiny | VSTUPNÉ A PROVOZNÍ DOBA 4085:7373 (4088:8328, 4088:8811) | Skupiny: Zámecká expozice, Kryt civilní obrany, Stálá výstava hraček nebo dětský okruh, Meda a Jan Mládek, Fotografování, Pronájem zahrady. Řádek: tučný štítek, podmínka, cena vpravo; hodiny po měsících, dětský okruh, zahrada, poznámky | ContentPricingMain a ContentHoursMain; kód | ticketList, openingPeriod |
| Citace | Frame 4079:6769, 1220×703 | Ornament, citace Romie na středu, podpis a datum (Návštěvník zámku Rosice, 30.8.2020) | Nová sekce quote; kód (Úvod), page builder | homePage.quote (text, autor, datum) |
| Hodnocení | na úvodu | 4,7 z Mapy.com, text Fantastické hodnocení zákazníků | Nová sekce rating; kód (Úvod) | siteSettings.rating |
| Fotogalerie | 4091:33751, výběr alb 4091:33773 (1220×985), šířka dlaždic 423×392 | Deset alb (Zámecký exteriér, okruhy, Mládek, hračky, sklo, Kryt CO, svatby, Šenk, výstavní prostory, Edukační centrum); aktivní album červeně podtržené | ContentGalleryMain; kód | gallery (10 alb) |
| Prohlížeč fotografií | 4091:35262 a 4091:35672, 1920×1054 | Tmavé pozadí, fotka na šířku nebo na výšku, šipky vlevo a vpravo, zavírátko, počítadlo 1/28 a popisek | Nová klientská komponenta GalleryLightbox (focus trap, Esc, šipky, alt a popisek) | gallery.images[] (alt, popisek, autor) |
| CTA s fotkou | horní část Group 11973 4081:958, 1647×702 | Fotka přes celou šířku, nadpis MÁTE DOTAZ? NEVÁHEJTE SE NÁM OZVAT, odkaz přejít na kontakty | ContentCtaMain; kód, sekce cta | cta (text, odkaz, obrázek) |
| Patička | Group 11973 4081:958 (desktop), Group 11989 4113:20826 (mobil) | Tři sloupce odkazů, údaje Správy zámku, telefony M a T a e-mail velkým písmem, loga partnerů, copyright a podpis designu | Footer; kód | navigation, siteSettings, partner |
| Kontaktní formulář | KONTAKTY 4094:40133 | Pole s podtržením: Jméno, Příjmení, E-mail, Vaše zpráva, souhlas se zpracováním osobních údajů, červené Odeslat; bez stavů chyby a úspěchu | Nová komponenta ContactForm + Worker endpoint; kód | siteSettings (cílový e-mail), person |

- Dopad na model Sanity: homePage dostane pole quote (text, autor, datum) a odkaz na vybrané prohlídky a tři promo bloky; siteSettings dostane rating (hodnota, zdroj, odkaz) a vstupné do lišty se bere z ticketList, ne ze samostatného pole.
- tour dostane pole eyebrow nebo druh (Doba prohlídky: 60 minut) a pořadí určuje stranu obrázku v seznamu.
- post má pole kind (Aktuality nebo Akce) a pole akce; v Aktualitách jsou tři bloky: Nadcházející události, Archív, zvláštní poloha Last minute (příznak featured). Samostatný typ event nevznikne (rozhodnutí 5).
- gallery: deset alb místo devíti; červený aktivní stav a počítadlo lightboxu řeší kód, ve Sanity jsou jen obrázky, alt, popisek a autor.
- navigation: tři menu skupiny s položkami, horní pravou část (Kontakty, Povinné a statutární informace), ikony sociálních sítí (Facebook, Instagram) a tři sloupce patičky; v dropdownu je fotka a info lišta, jsou stejné pro všechny tři skupiny.
- Prvky nové oproti balonhotel-site: StatusBar, Ornament, GalleryLightbox, ContactForm, quote a rating; pro ostatní existuje vzor v Lumos komponentách.

## Změny ve Figmě k 10. 11. 2026

| Místo | Stav v první inventuře | Stav v souboru |
| --- | --- | --- |
| Úvod, karty prohlídek | 505 px, tři sloupce | 370 px, čtyři sloupce, sedm karet (uzly 4144:*) |
| Úvod, promo | dva bloky (svatba, školní výlety) | tři bloky, přibyl Šenk (4144:15102) |
| Sekce FONTY (4177:15164) | neexistovala | Romie a Manrope |
| KONTAKTY | – | přibyl blok 4152:15163 |
| Mobil Vstupné (4113:21044) | veden jako hotový | 1850 px, jen první skupina cen |
| Patička | – | „Kryt civilní ochrany“, v obsahu „obrany“; platí „obrany“ |

## Poznámky designera pro AI (4075:30)

Sekce obsahuje výřezy z auditu přístupnosti stávajícího webu. Jsou to akceptační kritéria nového webu (rozhodnutí 9):

- **1.3.1:** úvod nemá `h1` a nadpisy nejdou sestupně. Každá stránka dostane právě jeden `h1` a hierarchii bez přeskoků.
- **2.4.4:** odkazy na aktuality tvoří jen obrázek s prázdným `alt`; odkaz na Kudy z nudy nemá přístupný název. Obrázkové odkazy dostanou `alt`, ikonové `aria-label`.
- `alt` patří jen na `img`; `aria-label` na interaktivní prvky.

## Chybí ve Figmě

Tyto stránky a stavy je třeba odvodit ze skořápky (Nav, Footer, Hero, řádek, karta, tabulka, tlačítko) a požádat designera o odsouhlasení.

| Oblast | Co chybí | Jak se odvodí |
| --- | --- | --- |
| Pronájmy | Svatby, Pronájem Šenku, Výstavy, Školní výlety (jen promo karty na úvodu a ukázkový text) | Hero s fotkou, text a fotky ze sekcí page builderu, ceník jako tabulka z Vstupného, CTA |
| Rozcestníky | Navštivte nás, Akce a možnosti, O zámku (dropdown je nahrazuje) | Nezakládat; když ano, řádky z rozbaleného menu |
| O zámku | Zámek v médiích, Partneři zámku | Seznam jako řádky událostí, loga z patičky |
| Úřední a právní | Statutární a povinné informace, Povinná publicita projektů, Ochrana osobních údajů, Prohlášení o přístupnosti | Šablona textové stránky Z historie a tabulky z Ceníku |
| Systémové | Mapa stránek, 404, chybový stav formuláře | Hero a seznam odkazů |
| Jazyky | Přepínač en a de v navigaci a v mobilním menu | Dokreslit; dlouhé německé názvy zkontrolovat v dropdownu |
| Mobil | Vstupné a provozní doba (jen začátek), detail prohlídky, Kde nás najdete, detail aktuality, kontakty a všechny nově odvozené stránky | Stejný režim jako existující mobilní frames (402 px, 370 px obsah) |
| Stavy | Hover, focus, aktivní odkaz, chyba a úspěch formuláře, načítání, prázdné seznamy (žádné nadcházející události) | Pravidla z Lumos a a11y skriptů; focus viditelný v #c20022 nebo #2c203c |
| Tablet | Mezi 402 a 1920 px nic | Fluidní rozměry a vlastní breakpointy, schválit s designerem |

---

[← README](../README.md)
