Render Scratch script code to HTML. 

Inspired by and mostly compatible with JSO's
excellent [Block Plugin](http://wiki.scratch.mit.edu/wiki/Block_Plugin) (which
is used on the [Scratch Forums](http://scratch.mit.edu/forums/) and [Scratch
Wiki](http://wiki.scratch.mit.edu)), with some bugfixes and updates for Scratch 2.0.

**scratchblocks2** is designed with an emphasis on flexibility: adding new blocks is as easy as writing the scratchblocks code itself.

[Scratch](http://scratch.mit.edu/) is created by the Lifelong Kindergarten Group
at the MIT Media Lab.


# Usage

Just include the CSS and JS in the `<head>` of your page:

    <link rel="stylesheet" type="text/css" href="scratchblocks2.css">
    <script type="text/javascript" src="scratchblocks2.js"></script>


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
