import headless from "./headless.js"
import { runTests } from "./runner.js"
import {} from "./tests.js"
;(async () => {
  await headless.start()

  await runTests(headless)

  await headless.stop()
})()
