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

* When developing, you'll want to run a local web server, eg.

    ```
    python2 -m SimpleHTTPServer 8000
    ```

* Browse to <http://localhost:8000/src/> to access the development version.

* If you make a change in `src/defs.css`, run `make css` to update the JS file.

* Before you send a PR, run `make` to check that the JS minifies correctly.

To rebuild the translations (eg. to take into account new updates on Pootle), use `make translations`.

To modify the homepage, send a PR to the [scratchblocks/scratchblocks.github.io](//github.com/scratchblocks/scratchblocks.github.io) repo.
