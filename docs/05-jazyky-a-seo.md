# 05 – Jazyky a SEO

## Jazyky

> **ROZHODNUTO: Rozhodnuto** Web běží ve třech jazycích, cs, en a de, s plně přeloženým obsahem od spuštění. Čeština je výchozí a bez předpony, ostatní jazyky mají /en a /de. Otevřená zůstává jediná věc: kdo překlady dodá.

| Typ | Jak se překládá | Poznámka |
| --- | --- | --- |
| page, tour, venue, post, event, gallery, faq | Dokument na jazyk (pole language + překladová metadata z @sanity/document-internationalization) | Každý jazyk má vlastní slug |
| homePage, navigation, visitInfo | Jedna instance na jazyk | Menu a patička se liší štítky i odkazy |
| siteSettings | Jedna instance; kontakty a právní údaje společné, výchozí SEO a názvy jako lokalizované pole | Telefon, e-mail, IČ a GPS se nezadávají třikrát |
| ticketList, openingPeriod | Jedna instance; ceny a data společné, štítky, podmínky a poznámky jako lokalizované pole | Změna ceny nebo hodin se dělá jednou |
| person, partner, project | Společný dokument, funkce, popis a název jako lokalizované pole | Jména a loga se nepřekládají |
| document | Jeden dokument, lokalizovaný název a soubor pro každý jazyk | Úřední PDF (závěrečné zprávy, rozpočty) mohou zůstat jen česky, označit na stránce |
| mediaMention | Bez překladu | Odkazy na česká média se ukazují ve všech jazycích |

- Adresy: čeština bez předpony, /en a /de s předponou, i18n v astro.config a helpery z lang.ts jako v balonhotelu. Slug je v každém jazyce vlastní (např. /navstivte-nas, /en/visit-us, /de/besuch).
- Lokalizované slugy: pro stránky v kódu mapa tras podle identifikátoru stránky (src/i18n/routes.ts, jeden záznam má slug pro cs, en, de), pro dynamické a page builder stránky slug z přeloženého dokumentu. Funkce localizedPath z balonhotelu (jen přidá předponu) se nahradí resolverem, který čte tuto mapu a překladová metadata.
- Přepínač jazyků v navigaci vede na překlad téže stránky ve vybraném jazyce. Alternativy se berou z mapy tras a z překladových metadat, ne z konstanty LANGS jako v alternates() v balonhotelu.
- hreflang: každá stránka má link rel alternate pro cs, en, de a x-default na češtinu, kanonická adresa ukazuje sama na sebe; html lang z localeOf (cs-CZ, en-GB, de-DE).
- Úplnost překladů: protože je obsah překládaný celý, publikace českého dokumentu bez en a de je chyba. Hlídá to validace ve Studiu (stav překladu) a kontrola v buildu, která selže na chybějícím překladu.
- Pevné texty rozhraní (tlačítka, štítky, Přečíst více, názvy dnů) jako typovaný slovník src/i18n/ui.cs.ts, ui.en.ts, ui.de.ts; chybějící klíč v kterémkoli jazyce je chyba typů.
- Formáty: data, měna a čísla podle jazyka (190 Kč, CZK 190), časy ve 24hodinovém tvaru; názvy dnů v provozní době z knihovny, ne z textu „Po–Čt“.
- Studio: seznamy dokumentů s filtrem podle jazyka, Presentation tool s přepínáním jazyka náhledu, locations pro každý jazyk, rozhraní Studia česky.
- Staré URL se přesměrovávají jen na české adresy, protože en a de dosud neexistovaly.

## SEO

- Objekt seo (metaTitle, metaDescription do 160 znaků, ogImage, noindex) na page, tour, venue, post, event, gallery a homePage; výchozí hodnoty v siteSettings. BaseHead z balonhotelu už přijímá title, description, image, noindex a schema, takže stačí napojit na data.
- JSON-LD: místo Hotel použít typ zámku (TouristAttraction nebo LandmarksOrHistoricalBuildings) a organizaci Správa zámku Rosice; Event pro akce, NewsArticle pro aktuality (už je v schema.ts), BreadcrumbList z ROUTE_LABELS, FAQPage pro faq.
- OpeningHoursSpecification se generuje ze strukturovaného openingPeriod včetně validFrom a validThrough; balonhotelové parsování textu „Po–Čt“ se nepoužije.
- Sitemap přes @astrojs/sitemap s i18n, s hreflang alternativami pro každý jazyk (vlastní serialize kvůli lokalizovaným slugům) a filtrem NOINDEX_ROUTES; robots.txt, llms.txt a manifest převzít z balonhotelu a upravit.
- JSON-LD: inLanguage podle jazyka stránky (v balonhotelu je napevno cs), og:locale a og:locale:alternate pro všechny tři jazyky.
- Přesměrování 301 všech starých adres (včetně /rok/měsíc/slug/) a kontrola kanonických adres.
- Přístupnost: Prohlášení o přístupnosti zůstává; kontroly přes skripty a11y-nav a overflow z balonhotelu.

---

[← README](../README.md)
