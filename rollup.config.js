import babel from "rollup-plugin-babel"
import commonjs from "rollup-plugin-commonjs"
import minify from "rollup-plugin-babel-minify"
import pkg from "./package.json"
import resolve from "rollup-plugin-node-resolve"
import serve from "rollup-plugin-serve"

export default [
  {
    input: "browser.js",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: "node_modules/**",
      }),
      minify({
        comments: false,
      }),
      serve({
        contentBase: ".",
        open: true,
        port: 8000,
      }),
    ],
  },
]
