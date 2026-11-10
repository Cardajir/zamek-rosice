# 01 – Sitemapa

Revidováno 10. 11. 2026, viz [09-revize.md](09-revize.md). Rozcestníky a stránka `/akce` nevzniknou; jejich adresy přesměrují (301) na první podstránku, resp. na `/aktuality`.

## Navržená sitemapa

Sloupec Realizace vychází z rozhodnutí o hybridním přístupu: kód znamená stránku napsanou v Astru jako v balonhotel-site (strukturované typy ve Sanity), page builder znamená obecnou textovou stránku složenou ze sekcí ve Sanity. Pronájmy (Svatby, Šenk, Výstavy, Školní výlety), historie, projekty, právní stránky i budoucí stránky jdou do page builderu. Sloupec Figma je ověřený proti souboru: uvádí frame a uzel (desktop, případně mobil) nebo Chybí, kde stránku nutno odvodit ze skořápky. Adresy jsou uvedené česky; v en a de mají vlastní slugy (např. /en/visit-us, /de/besuch), viz sekce Jazyky.

| URL | Stránka | Realizace | Figma (ověřeno) | Zdroj na starém webu | Sanity |
| --- | --- | --- | --- | --- | --- |
| / | Úvod | kód | Je: HOMEPAGE 4077:86 a mobil 4096:43693 | Úvodní stránka (hero text, 9 příspěvků) | homePage, post |
| /navstivte-nas | Navštivte nás | přesměrování | Není: Figma má jen dropdown Pro návštěvníky (4081:1011). **Nezakládá se**, 301 na `/navstivte-nas/prohlidky` | Informace pro návštěvníky (prázdná stránka) | – |
| /navstivte-nas/vstupne-a-oteviraci-doba | Vstupné a otevírací doba | kód | Je: VSTUPNÉ A PROVOZNÍ DOBA 4085:7373, mobil 4113:21044; tabulky cen (4 skupiny) a hodin (měsíce, zahrada, Správa zámku) | Vstupné a provozní doba | ticketList, openingPeriod, visitInfo |
| /navstivte-nas/prohlidky | Prohlídky a expozice (přehled) | kód | Je: PROHLÍDKOVÉ OKRUHY 4081:5384, osm řádků střídavě obrázek vlevo a vpravo, mobil 4113:18187 | Prohlídkové okruhy | tour |
| /navstivte-nas/prohlidky/[slug] | Detail prohlídky (7 až 8 stránek) | kód | Částečně: jediný příklad PROHLÍDKOVÉ OKRUHY (DETAIL) 4088:23922 (texty Žerotínského a Hausperského okruhu, fotky, tlačítka); mobil chybí | Zámecké expozice, Mládek, hračky, Kryt CO, zahrada, sklo | tour (slug z `localizedSlug`) |
| /navstivte-nas/kde-nas-najdete | Kde nás najdete | kód | Je: KDE NÁS NAJDETE 4085:7124 (GPS, odkaz Mapy.cz, auto, vlak, autobus, velká fotka); mapa nenakreslená, mobil chybí | Kde nás najdete | page, visitInfo, siteSettings |
| /navstivte-nas/navstevni-rad | Návštěvní řád | page builder | Je: NÁVŠTĚVNÍ ŘÁD 4085:7440, mobil 4113:21552 | Návštěvní řád | page |
| /akce-a-moznosti | Akce a pronájmy | přesměrování | Není: ve Figmě dropdown Akce a pronájmy (4081:2446). **Nezakládá se**, 301 na `/aktuality` | Akce a možnosti (prázdná stránka) | – |
| /akce-a-moznosti/svatby | Svatby | page builder | Chybí stránka: je jen promo karta na úvodu, položka v menu, odkaz v patičce a album Svatby na zámku v galerii | Svatby | page, venue, fileDocument |
| /akce-a-moznosti/pronajem-senk | Pronájem Šenku | page builder | Chybí stránka: promo blok na úvodu (Historický Šenk s velkým funkčním krbem), položka v menu, odkaz v patičce, album Společenský prostor Šenk | Pronájem Společenského prostoru Šenk | venue, page |
| /akce-a-moznosti/vystavy | Výstavy (pro vystavovatele) | page builder | Chybí stránka: jen položka v menu, album Výstavní prostory | Výstavy | page, venue |
| /akce-a-moznosti/skolni-vylety | Školní výlety | page builder | Chybí stránka: je jen promo karta na úvodu, odkaz Pro školy v patičce a ukázkový text v AKTUALITY (DETAIL) 4090:28531 | Školní výlety | page, ticketList |
| /akce | Program akcí | přesměrování | Není: akce jsou sekce uvnitř AKTUALITY (Nadcházející události, Archív již proběhlých akcí) a seznam na úvodu. **Nezakládá se**, 301 na `/aktuality` | Neexistuje (akce jsou příspěvky) | – |
| /aktuality | Aktuality | kód | Je: AKTUALITY 4088:23677 a mobil 4113:22557; řádek s plakátem, štítkem Aktuality nebo Akce, rokem a datem, Last minute sezóny 2026 | Kategorie Aktuality, Akce | post (`kind`: news, event; `featured` pro Last minute) |
| /aktuality/[slug] | Detail aktuality | kód | Je: AKTUALITY (DETAIL) 4090:28531; mobil chybí | 12 příspěvků | post; akce dostane JSON-LD Event |
| /o-zamku | O zámku | přesměrování | Není: ve Figmě dropdown O zámku (4081:3890). **Nezakládá se**, 301 na `/o-zamku/z-historie` | O zámku (prázdná stránka) | – |
| /o-zamku/z-historie | Z historie | page builder | Je: Z HISTORIE 4090:29009, mobil 4120:23924; textová stránka, časová osa není | Z historie | page |
| /o-zamku/zamek-v-mediich | Zámek v médiích | kód | Chybí: jen položka v menu | Zámek v médiích | mediaMention |
| /o-zamku/partneri-zamku | Partneři zámku | kód | Chybí stránka: jen položka v menu a řada log v patičce (RZ, Objevuj památky, kudyznudy.cz, Rosice) | Partneři zámku | partner |
| /fotogalerie | Fotogalerie (přehled) | kód | Je: FOTOGALERIE 4091:33751 (deset alb jako velké odkazy, aktivní červeně podtržené, pod nimi mřížka fotek), mobil 4120:24845 | Fotogalerie (prázdná stránka) | gallery |
| /fotogalerie/[slug] | Detail galerie (9×) | kód | Částečně: Figma má jednu stránku s výběrem alba a mřížkou; samostatný detail není. Prohlížeč: 4091:35262 (na šířku), 4091:35672 (na výšku), mobil 4120:26402 a 4120:29415 | 9 galerií | gallery; každé album má vlastní adresu, stránka je táž šablona s vybraným albem |
| /kontakt | Kontakt | kód | Je: KONTAKTY 4094:40133 (velké kontakty, osoby, formulář Jméno, Příjmení, E-mail, Vaše zpráva, souhlas, Odeslat, foto); mobil chybí | Kontakt | siteSettings, person |
| /statutarni-a-povinne-informace | Statutární a povinné informace | kód | Chybí stránka: odkaz v horní liště, v mobilním menu a v patičce | Statutární a povinné informace | fileDocument, siteSettings |
| /statutarni-a-povinne-informace/povinna-publicita-projektu | Povinná publicita projektů | page builder | Chybí stránka: odkaz v patičce | Povinná publicita projektů | project |
| /ochrana-osobnich-udaju | Ochrana osobních údajů | page builder | Chybí stránka: odkaz v patičce | Ochrana osobních údajů | page |
| /prohlaseni-o-pristupnosti | Prohlášení o přístupnosti | page builder | Chybí stránka: odkaz v patičce | Prohlášení o přístupnosti | page |
| /mapa-stranek | Mapa stránek | kód | Chybí: ve Figmě není ani odkaz | Mapa www stránek | generuje se z dat |
| /404 | Stránka nenalezena | kód | Chybí | – | – |
| /en, /de | Jazykové verze (cs, en, de), lokalizované slugy | kód + překlady | Chybí: v navigaci ani v mobilním menu není přepínač jazyků; je nutné ho dokreslit | Neexistují | `language` na page a post, lokalizovaná pole jinde |

Struktura adres je zjednodušená oproti starému webu (kratší, bez /informace-pro-navstevniky/prohlidkove-okruhy/). Každá stará adresa dostane přesměrování 301, viz Migrace.

---

[← README](../README.md)
