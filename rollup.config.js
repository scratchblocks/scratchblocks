import babel from "@rollup/plugin-babel"
import json from "@rollup/plugin-json"
import pkg from "./package.json"
import serve from "rollup-plugin-serve"
import license from "rollup-plugin-license"
import { terser } from "rollup-plugin-terser"
import csso from "./locales-src/rollup-optimized-css-text.js"

let { buildTarget } = process.env

if (typeof buildTarget === "undefined") {
  console.log('buildTarget undefined - setting to "DEV"')
  buildTarget = "DEV"
}

console.log(`buildTarget: ${buildTarget}`)

const env = {
  dev: buildTarget === "DEV",
  prod: buildTarget === "PROD",
}

const bannerText = `
<%= pkg.name %> v<%= pkg.version %>
<%= pkg.homepage %>
<%= pkg.description %>

Copyright 2013–<%= moment().format('YYYY') %>, <%= pkg.author %>
@license <%= pkg.license %>
`.trim()

const commonPreBabelOperations = isLocale => [
  isLocale ? undefined : csso({ minify: env.prod }),
  isLocale ? json() : undefined,
]

const commonPostBabelOperations = isModule => [
  env.prod &&
    terser({
      format: {
        comments: false,
      },
      compress: {
        unsafe: true, // Safe to turn on in most cases. This just means String(a) becomes "" + a
        unsafe_arrows: isModule, // Safe to turn on, unless there is an empty ES5 class declaration
        unsafe_math: true, // Safe to turn on, floating point math error is minor
      },
    }),
  license({
    sourcemap: true,
    banner: bannerText,
  }),
]

export default [
  {
    input: "browser.js",
    output: {
      file: pkg.main,
      format: "iife",
      name: "scratchblocks",
      sourcemap: env.prod,
    },
    plugins: [
      ...commonPreBabelOperations(),
      babel({ babelHelpers: "bundled" }),
      ...commonPostBabelOperations(),
      env.dev &&
        serve({
          contentBase: ".",
          port: 8000,
        }),
    ],
  },
  {
    input: "browser.es.js",
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: env.prod,
    },
    plugins: [
      ...commonPreBabelOperations(),
      // ESM bundle does not need Babel
      ...commonPostBabelOperations(true),
      env.dev &&
        serve({
          contentBase: ".",
          port: 8000,
        }),
    ],
  },
  {
    input: "locales-src/translations.js",
    output: {
      exports: "named",
      file: "build/translations.js",
      format: "iife",
      name: "translations",
      sourcemap: false,
    },
    plugins: [
      ...commonPreBabelOperations(true),
      babel({ babelHelpers: "bundled" }),
      ...commonPostBabelOperations(),
    ],
  },
  {
    input: "locales-src/translations-es.js",
    output: {
      file: "build/translations-es.js",
      format: "esm",
      sourcemap: false,
    },
    plugins: [
      ...commonPreBabelOperations(true),
      ...commonPostBabelOperations(true),
    ],
  },
  {
    input: "locales-src/translations-all.js",
    output: {
      file: "build/translations-all.js",
      format: "iife",
      name: "translationsAll",
      sourcemap: false,
    },
    plugins: [
      ...commonPreBabelOperations(true),
      babel({ babelHelpers: "bundled" }),
      ...commonPostBabelOperations(),
    ],
  },
  {
    input: "locales-src/translations-all-es.js",
    output: {
      file: "build/translations-all-es.js",
      format: "esm",
      sourcemap: false,
    },
    plugins: [
      ...commonPreBabelOperations(true),
      ...commonPostBabelOperations(true),
    ],
  },
]
