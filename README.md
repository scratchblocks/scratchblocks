Render Scratch blocks code to HTML.

![Screenshot](http://blob8108.github.com/scratchblocks2/screenshot.png)

Inspired by and mostly compatible with JSO's
excellent [Block Plugin](http://wiki.scratch.mit.edu/wiki/Block_Plugin) (which
is used on the [Scratch Forums](http://scratch.mit.edu/forums/) and [Scratch
Wiki](http://wiki.scratch.mit.edu)). This is a complete rewrite, and includes
some bugfixes and updates for Scratch 2.0.

**scratchblocks2** is designed with an emphasis on flexibility: adding new
blocks is as easy as writing the scratchblocks code itself.

It follows the philosophy of the original Block Plugin in that it tries to match
the code you write as closely as possible, and doesn't check you've used the
correct syntax.  The block text is only used to find the correct colour.

**Test it out [here](http://blob8108.github.com/scratchblocks2/)!**

It's designed for Scratch 2.0 and includes all the new blocks, as well as custom
blocks and old blocks that were in Scratch 1.4.

It also includes a few hacks, such as recognising list reporters -- just make
sure you refer to the list explicitly somewhere:

    add [something] to [list v]
    say (list)

_[Scratch](http://scratch.mit.edu/) is created by the Lifelong Kindergarten
Group at the MIT Media Lab._


# Usage

Include the CSS and JS in the `<head>` of your page:

    <link rel="stylesheet" type="text/css" href="scratchblocks2.css">
    <script type="text/javascript" src="scratchblocks2.js"></script>

Make sure the images `flag.png` and `arrows.png` are in the folder
`block_images`, which is in the same folder as the CSS.

In summary, your directory layout should look like this:

    block_images/
        arrows.png
        flag.png
    scratchblocks2.css
    scratchblocks2.js

Then just call `scratchblocks2.parse` after the page has loaded to render
matching page elements to shiny scratch blocks. Its sole argument is the
CSS-style selector for the page elements that contain the scratchblocks code.

    scratchblocks2.parse("pre.blocks");


# Development

scratchblocks2 uses [jQuery](http://jquery.com/) and the
[LESS](http://lesscss.org/) CSS preprocessor. Use the client-side version of
LESS for development, and compile it for release.

How the parser works:

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
