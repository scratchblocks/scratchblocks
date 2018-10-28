const path = require("path")

const tests = []

function test(name, source, lang) {
  tests.push({
    name,
    source,
    lang: lang || "en",
  })
}

function runTests(r) {
  return Promise.all(
    tests.map(tc => {
      const outputPath = path.join(
        "snapshots",
        tc.name.replace(/ /g, "-") + ".png"
      )
      console.log("running", tc.name)
      return (async () => {
        await r.snapshotToFile(tc.source, tc.lang, outputPath)
        console.log("✓ wrote", outputPath)
      })()
    })
  )
}

module.exports = {
  test,
  runTests,
}
