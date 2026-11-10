# 08 – Další kroky

## Další kroky

1. **Dodání chybějících podkladů od designera**: Figma je zinventarizovaná. Zbývají potřebné stavy a stránky ze sekce Chybí ve Figmě: mobilní frames, přepínač jazyků, pronájmy a stavy formuláře; potvrdit licence písem a barvy mimo proměnné.
2. **Rozhodnout otázky 4 a 8 a zjistit zdroj překladů**: Program akcí a struktura adres ovlivňují schéma i routing; jazyky a hybridní přístup jsou rozhodnuté, otevřené je jen, kdo dodá překlady.
3. **Založit nový repozitář ze šablony balonhotel-site**: Kopie bez fotek, videa, balonhotelových textů, seed dat a písem; ponechat Lumos komponenty, utils, sanity helpery, middleware, wrangler a skripty. Přejmenovat v package.json, consts.ts, sanity.config.ts, wrangler.jsonc.
4. **Nový Sanity projekt a dataset**: production, CORS pro doménu a workers.dev, read token pro náhled, PREVIEW_SECRET; studio na /studio.
5. **Schémata a Studio**: Typy z tabulky, plugin @sanity/document-internationalization (cs, en, de) a lokalizované pole od prvního dne, struktura Studia se singletony, locations pro Presentation, validace (perex 300 znaků, povinné alt, povinné všechny tři jazyky).
6. **Design tokeny a skořápka**: Naplnit base.css podle sekce Design tokeny (4 barvy z proměnných, doplňkové barvy po potvrzení, 13 textových stylů s mobilními variantami přes clamp), postavit Nav s dropdowny, StatusBar, Footer, Hero, Card, řádek události, Ornament a úvodní stránku. Skill lumos-import-figma použít s REST tokenem, MCP čte velké frames jen po částech.
7. **Šablony obsahu**: Klíčové stránky v Astru (tour, venue, post, gallery, kontakt, vstupné a otevírací doba) vždy ve třech jazycích; potom lehký page builder pro obecné textové stránky.
8. **Migrační skripty**: Převod WordPressu (stránky, příspěvky, média, PDF) do Sanity jako seed s identifikátory pro --undo; ruční kontrola textů.
9. **Překlady, SEO, přesměrování**: Doplnění en a de obsahu, kontrola úplnosti překladů v buildu, hreflang, JSON-LD, sitemap, _redirects, robots a llms.txt.
10. **Nasazení a přepnutí domény**: Worker na Cloudflare, build z GitHubu, test na workers.dev, přepnutí zamek-rosice.cz, kontrola přesměrování a Search Console; kontroly overflow a a11y před spuštěním.

---

[← README](../README.md)
