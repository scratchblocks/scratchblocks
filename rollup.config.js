import babel from "rollup-plugin-babel"
import builtins from "rollup-plugin-node-builtins"
import commonjs from "rollup-plugin-commonjs"
import globals from "rollup-plugin-node-globals"
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

console.log(`env.dev: ${env.dev}`)
console.log(`env.prod: ${env.prod}`)

const banner = `/*
  ${pkg.name} v${pkg.version}
  ${pkg.description}
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
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: "esm",
        sourcemap: true,
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
          open: true,
          port: 8000,
        }),
    ],
  },
]
