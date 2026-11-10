import { test } from "node:test";
import assert from "node:assert/strict";
import {
  alternates,
  langFromPath,
  matchRoute,
  rewriteTarget,
  routePath,
  stripLang,
} from "./routes.ts";
import { redirectFor } from "../redirects.ts";

test("language comes from the prefix, Czech has none", () => {
  assert.equal(langFromPath("/"), "cs");
  assert.equal(langFromPath("/kontakt/"), "cs");
  assert.equal(langFromPath("/en/"), "en");
  assert.equal(langFromPath("/de/kontakt/"), "de");
  assert.equal(stripLang("/de/kontakt/"), "/kontakt");
  assert.equal(stripLang("/en"), "/");
});

test("a route has its own address in each language", () => {
  assert.equal(routePath("home", "cs"), "/");
  assert.equal(routePath("home", "en"), "/en/");
  assert.equal(routePath("tours", "cs"), "/navstivte-nas/prohlidky/");
  assert.equal(
    routePath("tours", "de", "hausperger-rundgang"),
    "/de/besuch/fuehrungen/hausperger-rundgang/",
  );
});

test("an address is matched in the language of its prefix only", () => {
  assert.deepEqual(matchRoute("/en/visit/tours/"), { id: "tours", lang: "en" });
  assert.deepEqual(matchRoute("/en/news/concert/"), {
    id: "news",
    lang: "en",
    slug: "concert",
  });
  assert.equal(matchRoute("/visit/tours/"), undefined);
  assert.equal(matchRoute("/en/navstivte-nas/prohlidky/"), undefined);
  assert.equal(matchRoute("/kontakt/extra/"), undefined);
});

test("English and German are rendered by the Czech page file", () => {
  assert.equal(rewriteTarget("/en/"), "/");
  assert.equal(
    rewriteTarget("/de/besuch/anfahrt/"),
    "/navstivte-nas/kde-nas-najdete/",
  );
  assert.equal(rewriteTarget("/en/news/concert/"), "/aktuality/concert/");
  assert.equal(rewriteTarget("/kontakt/"), undefined);
  assert.equal(rewriteTarget("/en/nothing-here/"), undefined);
});

test("alternates leave out a language a detail page does not exist in", () => {
  assert.equal(alternates("contact").length, 3);
  assert.deepEqual(alternates("news", { cs: "koncert", en: "concert" }), [
    { lang: "cs", path: "/aktuality/koncert/" },
    { lang: "en", path: "/en/news/concert/" },
  ]);
});

test("retired addresses lead to where the content went", () => {
  assert.equal(redirectFor("/akce/"), "/aktuality/");
  assert.equal(redirectFor("/navstivte-nas"), "/navstivte-nas/prohlidky/");
  assert.equal(
    redirectFor("/2023/05/skolni-vylety/"),
    "/aktuality/skolni-vylety/",
  );
  assert.equal(
    redirectFor(
      "/informace-pro-navstevniky/prohlidkove-okruhy/kryt-civilni-obrany/",
    ),
    "/navstivte-nas/prohlidky/kryt-civilni-obrany/",
  );
  assert.equal(
    redirectFor("/fotogalerie/kryt-co/"),
    "/fotogalerie/kryt-civilni-obrany/",
  );
  assert.equal(redirectFor("/akce-a-moznosti/svatby/"), undefined);
  assert.equal(redirectFor("/kontakt/"), undefined);
});
