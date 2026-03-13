import path from "path"
import { renderToSVGString, loadLanguages } from "../node-ssr.js"
import { Resvg } from "@resvg/resvg-js"
import fs from "fs"

loadLanguages({
  de: JSON.parse(fs.readFileSync(path.join("locales", "de.json"), "utf-8")),
})

const tests = []

export function test(style, name, source, lang) {
  tests.push({
    style,
    name,
    source,
    lang: lang || "en",
  })

  if (style === "scratch3") {
    tests.push({
      style: "scratch3-high-contrast",
      name,
      source,
      lang: lang || "en",
    })
  }
}

export function runTests() {
  tests.forEach(tc => {
    const outputPath = path.join(
      "snapshots",
      tc.style,
      tc.name.replace(/ /g, "-") + ".png",
    )
    console.log("running", tc.name)
    const options = {
      languages: ["en", tc.lang],
      style: tc.style,
      scale: 1,
    }
    const svgString = renderToSVGString(tc.source, options)
    const resvg = new Resvg(svgString, {
      fitTo: {
        mode: "width",
        value: 800,
      },
      font: {
        loadSystemFonts: true,
      },
    })
    const pngData = resvg.render().asPng()
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, pngData)
    console.log("✓ wrote", outputPath)
  })
}
