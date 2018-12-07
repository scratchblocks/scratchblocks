import babel from "rollup-plugin-babel"
import builtins from "rollup-plugin-node-builtins"
import commonjs from "rollup-plugin-commonjs"
import conditional from "rollup-plugin-conditional"
import globals from "rollup-plugin-node-globals"
import minify from "rollup-plugin-babel-minify"
import pkg from "./package.json"
import resolve from "rollup-plugin-node-resolve"
import serve from "rollup-plugin-serve"

let { buildTarget } = process.env

if (typeof buildTarget === "undefined") {
  buildTarget = "DEV"
}

const env = {
  dev: buildTarget === "DEV",
  prod: buildTarget === "PROD",
}

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
      // // minify({
      // //   comments: false,
      // // }),
      conditional(env.dev, () => [
        serve({
          contentBase: ".",
          // open: true,
          port: 8000,
        }),
      ]),
    ],
  },
]
