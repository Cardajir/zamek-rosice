import assert from "node:assert/strict";
import { test } from "node:test";
import { redirectFor } from "./redirects.ts";

test("old WordPress posts become news items, unless they live on as a page", () => {
  assert.equal(
    redirectFor("/2024/04/svatba-v-zamecke-kapli/"),
    "/aktuality/svatba-v-zamecke-kapli/",
  );
  assert.equal(
    redirectFor("/2024/05/meda-a-jan-mladek-zivot-exil-umeni/"),
    "/navstivte-nas/prohlidky/meda-a-jan-mladek/",
  );
  assert.equal(
    redirectFor("/2020/06/vitejte-na-rosickem-zamku/"),
    "/o-zamku/z-historie/",
  );
});

test("old visitor pages, categories and the feed lead to their new place", () => {
  assert.equal(
    redirectFor("/informace-pro-navstevniky/vstupne-a-provozni-doba"),
    "/navstivte-nas/vstupne-a-oteviraci-doba/",
  );
  assert.equal(redirectFor("/category/akce/"), "/aktuality/");
  assert.equal(redirectFor("/category/homepage/"), "/");
  assert.equal(redirectFor("/feed/"), "/aktuality/");
});

test("addresses that stayed the same are not redirected", () => {
  assert.equal(redirectFor("/kontakt/"), undefined);
  assert.equal(redirectFor("/"), undefined);
});
