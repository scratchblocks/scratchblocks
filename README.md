Render Scratch blocks code to HTML.

![Screenshot](http://blob8108.github.io/scratchblocks2/screenshot.png)

**Test it [here](http://blob8108.github.io/scratchblocks2/)!**

---

**scratchblocks2** is used to write Scratch scripts on the [Scratch
Forums](http://scratch.mit.edu/discuss/topic/14772/) and [Scratch
Wiki](http://wiki.scratch.mit.edu/wiki/Block_Plugin).

## Syntax

It's inspired by the block plugin by JSO that was used on
the old [Scratch Forums](http://scratch.mit.edu/discuss/). It's a complete
rewrite for Scratch 2.0, but it still uses the same syntax (with some minor
additions).

It follows the philosophy of the original Block Plugin in that it tries to match
the code you write as closely as possible, and doesn't check you've used the
correct syntax. The block text is only used to find the correct colour.

It also includes a few hacks, such as recognising list reporters -- just make
sure you refer to the list explicitly somewhere:

    add [something] to [list v]
    say (list)

For the full guide to the syntax, see [the
wiki](http://wiki.scratch.mit.edu/wiki/Block_Plugin/Syntax).


# Usage

If you just want the code, have a look at the [example HTML
file](http://github.com/blob8108/scratchblocks2/blob/master/example.html),
which uses the scripts hosted on GitHub Pages, and jQuery hosted off Google.

For a more detailed explanation, or if you want to host the files yourself, read on.

You need to include jQuery (in the `<head>` of your page):

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.js"></script>
```

Then include the scratchblocks2 CSS and JS:

```html
<link rel="stylesheet" href="scratchblocks2.css">
<script src="scratchblocks2.js"></script>
```

Then just call `scratchblocks2.parse` after the page has loaded, which will
render matching page elements to shiny scratch blocks. Its sole argument is the
CSS-style selector for the elements that contain the scratchblocks code. It
uses `pre.blocks` by default.

```js
scratchblocks2.parse("pre.blocks");
```

Finally, you need to put `flag.png` and `arrows.png` in the folder
`block_images`, which must be in the same folder as `scratchblocks2.css`.

In summary, your directory layout should look something like this:

    block_images/
        arrows.png
        flag.png
    scratchblocks2.css
    scratchblocks2.js

## Inline blocks

To use blocks inside a paragraph...

```html
I'm rather fond of the <code class="b">stamp</code> block in Scratch.
```

...make a separate call to `parse` using the `inline` argument.

```js
scratchblocks2.parse("code.b", {inline: true});
```


# Credits

* Plugin by blob8108
* Inspired by JSO's [Block Plugin](http://wiki.scratch.mit.edu/wiki/Block_Plugin_\(1.4\))
* Help with translation code from [joooni](http://scratch.mit.edu/users/joooni/)
* Block translations from the [Scratch translation server](http://translate.scratch.mit.edu/)
