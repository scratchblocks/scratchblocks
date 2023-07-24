/**
 * Processes ".css.js" file.
 * The file is a valid JavaScript file that CJS-exports the CSS,
 * so that other code that directly require the files like the snapshot tests
 * do not break.
 */
export default opts => {
  opts = opts || {}
  if (opts.minify === undefined) {
    opts.minify = true
  }
  return {
    name: "optimized-css-text",
    transform: (code, id) => {
      if (id.endsWith(".css.js")) {
        return import(id)
          .then(({ default: code }) =>
            opts.minify
              ? import("csso").then(csso => csso.minify(code).css)
              : code,
          )
          .then(processed => ({
            code: `export default ${JSON.stringify(processed)}`,
            map: { mappings: "" },
          }))
      }
    },
  }
}
