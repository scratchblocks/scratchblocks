Hello!
Thanks for your interest in contributing to scratchblocks.

The [Community Guidelines](https://github.com/LLK/scratch-www/wiki/Community-Guidelines) for **[scratch-www](https://github.com/LLK/scratch-www)** also apply here. :-)

In particular, although this code is used on the Scratch website, it's not maintained by the Scratch Team. So please remember developing this isn't our job!

---

When **reporting an issue**, please do the following:

* Read [the **syntax guide**](http://wiki.scratch.mit.edu/wiki/Block_Plugin/Syntax)
* Use **code examples** and links to <http://scratchblocks.github.io/>, where relevant
* Provide **screenshots**/comparison with Scratch, where relevant

---

For **pull requests**:

* Make sure you have [node.js](https://nodejs.org/) >= 4.0 installed.

* Install packages:

  ```
  npm install
  ```

* Start the web-server:

  ```
  npm start
  ```

* Browse to <http://localhost:8080/> to access the development version.

* Before you send a PR, run `npm test` and take a look at the output in the `tests` folder.

To refetch the translations (eg. to take into account new updates on [Pootle](translate.scratch.mit.edu/)), use `npm run translations`.

To modify the homepage, send a PR to the [scratchblocks/scratchblocks.github.io](https://github.com/scratchblocks/scratchblocks.github.io) repo.
