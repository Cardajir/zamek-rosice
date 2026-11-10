# Rozhodnutí

Souhrn rozhodnutí, která jsou hotová. Otevřené věci jsou v [07-otevrene-otazky.md](07-otevrene-otazky.md).

## 1. Jazyky: cs, en, de s plně přeloženým obsahem od spuštění

- Web běží ve třech jazycích, **čeština je výchozí** a bez předpony, ostatní jazyky mají /en a /de.
- Obsah je **přeložený celý od spuštění**; publikace českého dokumentu bez en a de je chyba. Hlídá to validace ve Studiu a kontrola v buildu.
- Model: dokumenty na jazyk (`@sanity/document-internationalization`), lokalizované slugy přes `src/i18n/routes.ts`, hreflang s x-default, lokalizovaná pole `localizedString` a `localizedText` pro strukturovaná data (ceny a hodiny se zadávají jednou).
- **Zůstává otevřené:** kdo překlady dodá (zámek, překladatel, strojový překlad s korekturou) a v jakém termínu.
- Podrobnosti: [05-jazyky-a-seo.md](05-jazyky-a-seo.md).

## 2. Hybridní přístup: klíčové stránky v kódu, page builder jen pro obecné textové stránky

- **V kódu (Astro, .astro) jsou klíčové stránky:** úvod, prohlídky, vstupné a provozní doba, kontakt, aktuality, akce, galerie. Čtou strukturované typy ve Sanity (homePage, tour, ticketList, openingPeriod, siteSettings, person, post, event, gallery).
- **Lehký page builder** (`page.sections[]`) slouží **jen pro obecné textové stránky**: historie, projekty, pronájmy (Svatby, Šenk, Výstavy, Školní výlety), právní texty a budoucí stránky. Sekce se nikdy nepoužívají k sestavení klíčových stránek.
- Důvod: úprava textu Svateb nebo Historie nevyžaduje nasazení, zatímco struktura úvodu, prohlídek, cen a hodin zůstává pod kontrolou kódu.
- Podrobnosti: [01-sitemap.md](01-sitemap.md), [02-sanity-model.md](02-sanity-model.md).

## 3. Stack a konvence

- Stejný stack jako balonhotel-site (Astro, Lumos, Sanity, Cloudflare), nový repozitář, nový Sanity projekt a vlastní Worker. Soubory písem z balonhotelu se nekopírují (licence).

## 4. Figma je zinventarizovaná

- Přístup funguje, inventura je hotová (frames, komponenty, tokeny, pokrytí sitemapy). Zbývá dodání chybějících stránek a stavů, viz [03-figma-a-komponenty.md](03-figma-a-komponenty.md).
