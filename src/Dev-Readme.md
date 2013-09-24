# Development

## Setting up

You need a Unix system.

* Install [Python](http://python.org/).

* Install [npm](http://npmjs.org/), the [node](http://nodejs.org) package
  manager.

* Install the [LESS](http://lesscss.org/) CSS preprocessor, **version 1.3**:

        $ npm install less@1.3

    You should now have the `lessc` command installed:

        $ lessc
        lessc: no input files

* Install [UglifyJS2](http://github.com/mishoo/UglifyJS2):

        $ npm install uglify-js


## Developing

The source is found under `src/`. Use `src/dev.html` for testing the code.

* `scratchblocks2.js` -- all the parser code.

* `scratchblocks2.less` -- all the styles.

    The dev HTML file is set up to watch the LESS file for changes.

* `blocks.txt` -- The list of blocks, in scratchblocks format. Added to the final JS file by `src/compile_blocks.py`.

    Special values:

    * `[list v]` -- used to identify list dropdowns
    * `[sqrt v]` -- identifies math function, in the `([sqrt v] of ())` block

* `diacritics.js` -- contains the diacritic removal map. Added to the final JS file by `src/compile_blocks.py`.

Before committing your changes, run `src/compile.sh` to compile the project into `build/`. Use `build/test.html` to check it still works.


## Internals

A brief overview of the parser in `scratchblocks2.js`:

* splits the code into lines
* splits each line into *pieces*, where a piece is either text `"point in
  direction"` or an insert `[mouse-pointer v]`
* builds DOM elements using jQuery's `$("<div>")` syntax
* calls the render function recursively to render the inserts
* looks up the block's text in a database to get its color (category), using the
  type of the inserts to resolve multiple matches

The block database used for the categories is parsed from
`scratchblocks2.blocks`, which is a simple list of blocks in the scratchblocks
format itself. Modifying the value at runtime should cause the blocks database
to automatically update.

