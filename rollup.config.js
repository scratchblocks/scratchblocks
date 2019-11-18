import babel from "rollup-plugin-babel"
import builtins from "rollup-plugin-node-builtins"
import commonjs from "rollup-plugin-commonjs"
import globals from "rollup-plugin-node-globals"
import json from "rollup-plugin-json"
import minify from "rollup-plugin-babel-minify"
import pkg from "./package.json"
import resolve from "rollup-plugin-node-resolve"
import serve from "rollup-plugin-serve"

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

const banner = `/**
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 *
 * Copyright 2019–${new Date().getFullYear()}, ${pkg.author.name}
 * Copyright 2013–2019, Tim Radvan
 * @license ${pkg.license}
 */`

console.log(banner)

export default [
  {
    input: "browser.js",
    output: [
      {
        file: pkg.main,
        format: "iife",
        name: "scratchblocks",
        sourcemap: env.prod,
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: env.prod,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      babel(),
      globals(),
      builtins(),
      env.prod &&
        minify({
          banner: banner,
          bannerNewLine: true,
          comments: false,
        }),
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
      resolve(),
      json(),
      commonjs(),
      babel(),
      env.prod &&
        minify({
          banner: banner,
          bannerNewLine: true,
          comments: false,
        }),
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
      resolve(),
      json(),
      commonjs(),
      babel(),
      env.prod &&
        minify({
          banner: banner,
          bannerNewLine: true,
          comments: false,
        }),
    ],
  },
]
