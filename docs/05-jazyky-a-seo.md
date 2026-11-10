# 05 – Jazyky a SEO

## Jazyky

> **ROZHODNUTO** Web běží ve třech jazycích, cs, en a de. Čeština je výchozí a bez předpony, ostatní jazyky mají /en a /de. Model překladů a kontrola úplnosti byly 10. 11. 2026 přepracovány, viz rozhodnutí 6 a 7 v [decisions.md](decisions.md). Otevřené zůstává, kdo překlady dodá.

| Typ | Jak se překládá | Poznámka |
| --- | --- | --- |
| page, post | Dokument na jazyk (pole language + překladová metadata z @sanity/document-internationalization) | Každý jazyk má vlastní slug; reference míří na český dokument |
| tour, venue, gallery, faq | Jeden dokument, lokalizovaná pole včetně `localizedSlug` | Délka, pořadí a fotky se zadávají jednou |
| homePage, navigation, visitInfo | Jedna instance, lokalizovaná pole | Struktura menu je společná, liší se jen štítky |
| siteSettings | Jedna instance; kontakty a právní údaje společné, výchozí SEO a názvy jako lokalizované pole | Telefon, e-mail, IČ a GPS se nezadávají třikrát |
| ticketList, openingPeriod | Jedna instance; ceny a data společné, štítky, podmínky a poznámky jako lokalizované pole | Změna ceny nebo hodin se dělá jednou |
| person, partner, project | Společný dokument, funkce, popis a název jako lokalizované pole | Jména a loga se nepřekládají |
| fileDocument | Jeden dokument, lokalizovaný název a soubor pro každý jazyk | Úřední PDF (závěrečné zprávy, rozpočty) mohou zůstat jen česky, označit na stránce |
| mediaMention | Bez překladu | Odkazy na česká média se ukazují ve všech jazycích |

- Adresy: čeština bez předpony, /en a /de s předponou, i18n v astro.config a helpery z lang.ts jako v balonhotelu. Slug je v každém jazyce vlastní (např. /navstivte-nas, /en/visit-us, /de/besuch).
- Lokalizované slugy: pro stránky v kódu mapa tras podle identifikátoru stránky (`src/i18n/routes.ts`, jeden záznam má cestu pro cs, en, de); pro `tour`, `venue`, `gallery` z pole `localizedSlug`; pro `page` a `post` slug z přeloženého dokumentu.
- Přepínač jazyků v navigaci vede na překlad téže stránky ve vybraném jazyce. Alternativy se berou z mapy tras a z překladových metadat, ne z konstanty LANGS jako v alternates() v balonhotelu.
- hreflang: každá stránka má link rel alternate pro cs, en, de a x-default na češtinu, kanonická adresa ukazuje sama na sebe; html lang z localeOf (cs-CZ, en-GB, de-DE).
- Úplnost překladů: web se renderuje na požadavek, takže **build nic nehlídá**. Hlídá to validace ve Studiu (lokalizovaná pole povinně ve třech jazycích) a skript `npm run i18n:check` (CI a denně). Stránka bez překladu vrací v daném jazyce 404 a nemá hreflang. Aktuality lze publikovat jen česky; výpis v en a de ukazuje jen přeložené.
- Pevné texty rozhraní (tlačítka, štítky, Přečíst více, názvy dnů) jako typovaný slovník src/i18n/ui.cs.ts, ui.en.ts, ui.de.ts; chybějící klíč v kterémkoli jazyce je chyba typů.
- Formáty: data, měna a čísla podle jazyka (190 Kč, CZK 190), časy ve 24hodinovém tvaru; názvy dnů v provozní době z knihovny, ne z textu „Po–Čt“.
- Studio: seznamy dokumentů s filtrem podle jazyka, Presentation tool s přepínáním jazyka náhledu, locations pro každý jazyk, rozhraní Studia česky.
- Staré URL se přesměrovávají jen na české adresy, protože en a de dosud neexistovaly.

## SEO

- Objekt seo (metaTitle, metaDescription do 160 znaků, ogImage, noindex) na page, tour, venue, post, gallery a homePage; výchozí hodnoty v siteSettings. BaseHead z balonhotelu už přijímá title, description, image, noindex a schema, takže stačí napojit na data.
- JSON-LD: místo Hotel použít typ zámku (TouristAttraction nebo LandmarksOrHistoricalBuildings) a organizaci Správa zámku Rosice; Event pro akce, NewsArticle pro aktuality (už je v schema.ts), BreadcrumbList z ROUTE_LABELS, FAQPage pro faq.
- OpeningHoursSpecification se generuje ze strukturovaného openingPeriod včetně validFrom a validThrough; balonhotelové parsování textu „Po–Čt“ se nepoužije.
- Sitemap přes @astrojs/sitemap s i18n, s hreflang alternativami pro každý jazyk (vlastní serialize kvůli lokalizovaným slugům) a filtrem NOINDEX_ROUTES; robots.txt, llms.txt a manifest převzít z balonhotelu a upravit.
- JSON-LD: inLanguage podle jazyka stránky (v balonhotelu je napevno cs), og:locale a og:locale:alternate pro všechny tři jazyky.
- Přesměrování 301 všech starých adres (včetně /rok/měsíc/slug/) z mapy `src/redirects.ts` v middlewaru, a kontrola kanonických adres.
- Přístupnost: WCAG 2.1 AA je zákonná povinnost (zákon č. 99/2019 Sb.), viz rozhodnutí 9. Prohlášení o přístupnosti zůstává a aktualizuje se.

---

[← README](../README.md)
