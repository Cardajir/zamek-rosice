import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPhone } from "./consts.ts";

const shown = (value: string) => formatPhone(value).replaceAll(" ", " ");

test("a phone number reads as the design writes it", () => {
  assert.equal(shown("+420 606 683 229"), "(+420) 606 683 229");
  assert.equal(shown("+420606683229"), "(+420) 606 683 229");
  assert.equal(shown("00420 546 412 891"), "(+420) 546 412 891");
  assert.equal(shown("546 412 891"), "(+420) 546 412 891");
  assert.equal(shown("+421 905 123 456"), "(+421) 905 123 456");
});

test("the number stays on one line", () => {
  assert.equal(formatPhone("+420 606 683 229").includes(" "), false);
});

test("a number it does not recognise is shown as typed", () => {
  assert.equal(formatPhone(" +44 20 7946 0958 "), "+44 20 7946 0958");
  assert.equal(formatPhone(""), "");
});
