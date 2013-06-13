Render Scratch blocks code to HTML.

![Screenshot](http://blob8108.github.io/scratchblocks2/screenshot.png)

**Test it out [here](http://blob8108.github.io/scratchblocks2/)!**

---

**scratchblocks2** is used on the [Scratch
Wiki](http://wiki.scratch.mit.edu/wiki/Block_Plugin) to write Scratch scripts in wiki
articles.

It's inspired by and compatible with the block plugin by JSO that was used on
the old [Scratch Forums](http://scratch.mit.edu/discuss/). This is a complete
rewrite for Scratch 2.0.

It's designed with an emphasis on flexibility: adding new blocks is as easy as
writing the scratchblocks code itself.

It follows the philosophy of the original Block Plugin in that it tries to match
the code you write as closely as possible, and doesn't check you've used the
correct syntax. The block text is only used to find the correct colour.

It also includes a few hacks, such as recognising list reporters -- just make
sure you refer to the list explicitly somewhere:

    add [something] to [list v]
    say (list)

_[Scratch](http://scratch.mit.edu/) is created by the Lifelong Kindergarten
Group at the MIT Media Lab._


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


# Credits

* Plugin by blob8108
* Inspired by JSO's [Block Plugin](http://wiki.scratch.mit.edu/wiki/Block_Plugin)
* German block translation by [joooni](http://scratch.mit.edu/users/joooni/)
* Brazilian Portugese block translation by [ehermann](http://github.com/ehermann)

