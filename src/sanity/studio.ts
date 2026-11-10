import { createElement, Fragment } from "react";
import { buildLegacyTheme, type LayoutProps } from "sanity";

/*
 * The Studio in the site's own clothes: its violet and red, its text face,
 * and the castle's initial for the workspace. The colours are the swatches
 * of `src/styles/base.css`; they are repeated here because the Studio is a
 * separate React app that never loads the site's stylesheet.
 */
const VIOLET = "#2c203c";
const VIOLET_SOFT = "#453a55";
const RED = "#c20022";
const GREY = "#777080";
const WHITE = "#ffffff";

const FONT =
  'Manrope, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const studioTheme = buildLegacyTheme({
  "--font-family-base": FONT,
  "--black": VIOLET,
  "--white": WHITE,
  "--gray-base": GREY,
  "--gray": GREY,
  "--component-bg": WHITE,
  "--component-text-color": VIOLET,
  "--brand-primary": VIOLET_SOFT,
  "--default-button-color": GREY,
  "--default-button-primary-color": VIOLET_SOFT,
  "--default-button-success-color": "#2f8f4e",
  "--default-button-warning-color": "#a8730f",
  "--default-button-danger-color": RED,
  "--focus-color": VIOLET_SOFT,
  "--main-navigation-color": VIOLET,
  "--main-navigation-color--inverted": WHITE,
  "--state-info-color": VIOLET_SOFT,
  "--state-success-color": "#2f8f4e",
  "--state-warning-color": "#a8730f",
  "--state-danger-color": RED,
});

/* Manrope in the two subsets Czech, English and German need. */
const SUBSETS = {
  latin:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  "latin-ext":
    "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
} as const;

const FONT_FACES = [400, 500, 600, 700]
  .flatMap((weight) =>
    Object.entries(SUBSETS).map(
      ([subset, range]) =>
        `@font-face{font-family:Manrope;font-style:normal;font-weight:${weight};font-display:swap;src:url("/fonts/manrope-${weight}-${subset}.woff2") format("woff2");unicode-range:${range}}`,
    ),
  )
  .join("");

/** The Studio's own layout, with the site's text face made available to it. */
export function StudioLayout(props: LayoutProps) {
  return createElement(
    Fragment,
    null,
    createElement("style", null, FONT_FACES),
    props.renderDefault(props),
  );
}

/** The workspace's mark: the castle's initial, light on violet. */
export function StudioIcon() {
  return createElement(
    "svg",
    { viewBox: "0 0 32 32", width: "1em", height: "1em", "aria-hidden": true },
    createElement("rect", { width: 32, height: 32, rx: 4, fill: VIOLET }),
    createElement(
      "text",
      {
        x: 16,
        y: 23,
        textAnchor: "middle",
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 21,
        fill: WHITE,
      },
      "R",
    ),
  );
}
