Render Scratch blocks code to HTML.

![Screenshot](http://i.imgur.com/zp9Sty7.png)

Inspired by and mostly compatible with JSO's
excellent [Block Plugin](http://wiki.scratch.mit.edu/wiki/Block_Plugin) (which
is used on the [Scratch Forums](http://scratch.mit.edu/forums/) and [Scratch
Wiki](http://wiki.scratch.mit.edu)). This is a complete rewrite, and includes some bugfixes and updates for Scratch 2.0.

**scratchblocks2** is designed with an emphasis on flexibility: adding new blocks is as easy as writing the scratchblocks code itself.

It follows the philosophy of the Block Plugin in that it tries to match the code you
write as closely as possible, and doesn't check you've used the correct syntax.
The block text is only used to find the correct category (colour).

It's designed for Scratch 2.0, so it includes the new blocks as well as custom
blocks. Blocks that were in Scratch 1.4 but have been removed in 2.0, or had
their text changed, will render red for *obsolete*. These include:

* `forever if <>`
* `<loud?>`
* `stop script` (replaced by `stop [this script v]`)
* `stop all` (replaced by `stop [all v]`)
* `if <>` (renamed `if <> then`)
* `switch to costume [costume1 v]` (renamed `switch costume to`)
* `when clicked` (renamed `when this sprite clicked`)

It also includes a few hacks, such as recognising list reporters -- just make sure
you refer to the list explicitly somewhere:

    add [something] to [list v]
    say (list)

_[Scratch](http://scratch.mit.edu/) is created by the Lifelong Kindergarten Group
at the MIT Media Lab._

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
