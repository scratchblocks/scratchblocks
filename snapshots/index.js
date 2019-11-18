const headless = require('./headless');
const { runTests } = require('./runner');
require('./tests');
(async () => {
  await headless.start();

  await runTests(headless);

  await headless.stop();
})();
