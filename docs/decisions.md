# Rozhodnutí

Souhrn rozhodnutí, která jsou hotová. Otevřené věci jsou v [07-otevrene-otazky.md](07-otevrene-otazky.md). Co se změnilo proti první verzi plánu a proč, je v [09-revize.md](09-revize.md).

## 1. Jazyky: cs, en, de

- Web běží ve třech jazycích, **čeština je výchozí** a bez předpony, ostatní jazyky mají `/en` a `/de`.
- Cílem je plně přeložený obsah od spuštění. **Výjimkou jsou aktuality** (viz rozhodnutí 7).
- **Zůstává otevřené:** kdo překlady dodá a v jakém termínu.
- Podrobnosti: [05-jazyky-a-seo.md](05-jazyky-a-seo.md).

## 2. Hybridní přístup: klíčové stránky v kódu, page builder jen pro textové stránky

- **V kódu (Astro) jsou klíčové stránky:** úvod, prohlídky, vstupné a provozní doba, kde nás najdete, kontakt, aktuality, fotogalerie. Čtou strukturované typy ze Sanity.
- **Lehký page builder** (`page.sections[]`) slouží jen pro obecné textové stránky: historie, pronájmy (Svatby, Šenk, Výstavy, Školní výlety), návštěvní řád, právní texty a budoucí stránky.
- Samostatná stránka `/akce` **nevznikne** (viz rozhodnutí 5).

## 3. Stack: čistý Lumos, nejnovější verze

- Projekt je založený **čistou instalací Lumos for Astro** (`npm create lumos@latest`), ne kopií balonhotel-site. balonhotel-site zůstává jen jako **reference** pro napojení Sanity, náhled a i18n; žádné jeho soubory, fotky ani písma se nepřebírají.
- Verze k 10. 11. 2026:

| Balík | Verze | Poznámka |
| --- | --- | --- |
| Lumos for Astro | 1.0.3 | balonhotel-site běží na 0.0.3; složky komponent jsou nově malými písmeny (`src/components/content/`) |
| astro | 7.4.8 | |
| @astrojs/cloudflare | 14.4.6 | `output: server`, Worker |
| @astrojs/react | 7.1.5 | jen kvůli Sanity Studiu |
| @astrojs/sitemap | 3.7.4 | |
| @astrojs/check | 0.9.12 | |
| sanity, @sanity/vision | 6.22.0 | |
| @sanity/astro | 3.6.1 | |
| @sanity/client | 8.15.1 | |
| @sanity/document-internationalization | 6.2.46 | jen pro `page` a `post` |
| react, react-dom | 19.3.1 | |
| wrangler | 4.159.0 | |
| typescript | 6.0.3 | **Ne 7.0.2:** `@astrojs/check` 0.9.12 podporuje jen `^5 \|\| ^6`. Zvednout, až vyjde kompatibilní verze. |
| Node | ≥ 22.23.4 | požadavek Astro 7.4 |

## 4. Figma je zinventarizovaná

- Inventura je v [03-figma-a-komponenty.md](03-figma-a-komponenty.md), ověřená znovu 10. 11. 2026. Figma se mezi první inventurou a revizí změnila; při každém importu sekce se bere aktuální stav souboru, ne tabulka v dokumentu.

## 5. Akce jsou aktuality s druhem „Akce“

- **Typ `event` nevznikne.** Figma řeší akce uvnitř Aktualit (Nadcházející události, Archív již proběhlých akcí, Last minute) a na úvodu, samostatnou stránku nemá.
- `post` má pole `kind` (`news` | `event`). Pro `event` jsou navíc pole `eventStart`, `eventEnd`, `eventTimeNote`, `eventPlace`, `eventPrice`, `eventTicketUrl`, `eventStatus`.
- Výpis: nadcházející = `kind == "event"` a konec akce v budoucnu; archív = proběhlé akce; „Last minute“ = příznak `featured`.
- JSON-LD: `Event` pro akce, `NewsArticle` pro aktuality.

## 6. Model překladů: dokument na jazyk jen pro `page` a `post`

- **Dokument na jazyk** (plugin `@sanity/document-internationalization`): `page`, `post`. Jsou to dlouhé texty s vlastním slugem.
- **Jeden dokument s lokalizovanými poli** (`localizedString`, `localizedText`, `localizedSlug`, `localizedBlockContent`): `tour`, `venue`, `gallery`, `faq`, `ticketList`, `openingPeriod`, `person`, `partner`, `project`, `fileDocument` a singletony `siteSettings`, `navigation`, `homePage`, `visitInfo`.
- Důvod: sdílené typy (`ticketList`, `openingPeriod`, `navigation`) odkazují na `tour` a `venue`. S dokumentem na jazyk by nebylo jasné, na kterou verzi; délka, pořadí a fotky by se zadávaly třikrát a rozcházely by se.
- **Pravidlo pro odkazy na `page` a `post`:** reference vždy míří na český dokument. Překlad se dohledá přes `translation.metadata`.

## 7. Úplnost překladů: bez kontroly v buildu

- Web se renderuje na požadavek (Worker), publikace v Sanity build nespouští. **Kontrola v buildu se ruší.**
- Místo ní:
  1. **Validace ve Studiu:** lokalizovaná pole strukturovaných typů vyžadují cs, en i de.
  2. **Skript `npm run i18n:check`** projde dataset a vypíše české `page` bez překladu. Běží v CI a jednou denně.
  3. **Chování webu:** stránka bez překladu vrací v daném jazyce 404, nemá `hreflang` a není v sitemapě pro ten jazyk.
- **Aktuality jsou výjimka:** český `post` jde publikovat hned. Výpis v en a de ukazuje jen přeložené příspěvky.
- **Provozní oznámení** (uzavírka okruhu, změna hodin) se nezadává jako aktualita, ale do `visitInfo.notices[]` (krátký lokalizovaný text, povinně tři jazyky) a jako výjimka v `openingPeriod`.

## 8. Provozní doba: strukturovaná, s výjimkami a svátky

- `openingPeriod` má `kind` (`regular` | `exception`), rozsah dat, dny, časy, poslední vstup a **strukturované začátky prohlídek** (`startRule`: `everyHour`, `oddHours`, `evenHours`, `listed` + seznam časů).
- **Přednost při překryvu:** výjimka před běžným obdobím; mezi stejnými druhy vyhrává kratší rozsah dat; při shodě vyšší `priority`.
- **Svátky** se počítají v kódu (státní svátky ČR včetně Velkého pátku a Velikonočního pondělí), nezadávají se.
- Časové pásmo je vždy `Europe/Prague`.
- **Stav „Dnes otevřeno“** v liště se počítá z těchto dat. Text „9:00 – 18:00“ a ceny „180 Kč / 90 Kč“ ve Figmě jsou vzorové; lišta ukazuje ceník s příznakem `showInStatusBar` (dnes 190 / 140 Kč).
- Logika je v `src/utils/opening.ts` s testy (`npm test`).

## 9. Přístupnost: WCAG 2.1 AA je povinnost

- Správa zámku je příspěvková organizace, vztahuje se na ni **zákon č. 99/2019 Sb.** (EN 301 549, WCAG 2.1 AA). Není to volba.
- Nálezy z auditu, které jsou ve Figmě v sekci „NA CO SI DÁT POZOR OD AI“, jsou **akceptační kritéria**:
  - každá stránka má právě jeden `h1` a nadpisy jdou po sobě bez přeskakování úrovní (1.3.1),
  - odkaz tvořený jen obrázkem má na obrázku smysluplný `alt` (2.4.4),
  - ikonové odkazy (sociální sítě, loga partnerů, Kudy z nudy) mají `aria-label` (2.4.4).
- Ve schématech je `alt` u obrázků povinný.
- Světle fialová `#9790a0` (kontrast 3,1 : 1) se smí použít jen pro velký text a dekorace. Pro malé štítky je token `--muted-text` `#777080` (4,8 : 1), **ke schválení designerem**.

## 10. Formulář, cookies, přesměrování

- **Kontaktní formulář:** endpoint ve Workeru, ochrana Cloudflare Turnstile a honeypot, odeslání e-mailu přes e-mailovou službu Cloudflare z Workeru; pokud nebude pro účet dostupná, přes Resend. Cílová adresa je v `siteSettings`. Endpoint `/api/contact` zatím odesílá přes Resend (stačí klíč a ověřená doména); vazba na e-mailovou službu Cloudflare se doplní, až bude účet.
- **Cookies:** žádná analytika s cookies. Měření přes Cloudflare Web Analytics (bez cookies). Web používá jen nezbytné cookies (náhled Studia, Turnstile), **cookie lišta proto není potřeba**. Pokud zámek bude chtít Google Analytics nebo vložené YouTube, lišta přibude.
- **Přesměrování starých adres:** mapa v kódu (`src/redirects.ts`), vyřizuje ji middleware. Soubor `_redirects` se nepoužije.

## 11. Názvosloví

- Jednotně **„Kryt civilní obrany“** (zkráceně Kryt CO). Patička ve Figmě má „Kryt civilní ochrany“; opravit v návrhu.
