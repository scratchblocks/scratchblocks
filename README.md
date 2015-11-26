Render Scratch blocks code to HTML.

![Screenshot](http://scratchblocks.github.io/screenshot.png)

**[Try it out!](http://scratchblocks.github.io/)**

---

**scratchblocks2** is used to write Scratch scripts:

- in [Scratch Forum](http://scratch.mit.edu/discuss/topic/14772/) posts
- in [Scratch Wiki](http://wiki.scratch.mit.edu/wiki/Block_Plugin) articles 
- in the [Code Club](https://www.codeclub.org.uk) project guides

It's MIT licensed, so you can use it in your projects. But email me afterward; I'd love to hear about it :)

## Syntax

It's inspired by the block plugin by JSO that was used on
the old [Scratch Forums](http://scratch.mit.edu/discuss/). It's a complete
rewrite for Scratch 2.0, but it still uses the same syntax (with some minor
additions).

It follows the philosophy of the original Block Plugin in that it tries to match
the code you write as closely as possible, and doesn't check you've used the
correct syntax. The block text is only used to find the correct colour.

For the full guide to the syntax, see [the
wiki](http://wiki.scratch.mit.edu/wiki/Block_Plugin/Syntax).

## Languages

The version of [`translations.js`](https://github.com/blob8108/scratchblocks2/blob/master/src/translations.js) in this repo is designed for the Scratch Forums, so it supports [all the languages there](http://scratch.mit.edu/discuss/#category_head_6).

However, the plugin _can_ be made to accept any of the languages that Scratch supports. You just need to modify and run [`build_translations.py`](https://github.com/blob8108/scratchblocks2/blob/master/src/build_translations.py) yourself, which will fetch language files from the [Scratch translation server](http://translate.scratch.mit.edu).

scratchblocks2 also requires some [additional words](https://github.com/blob8108/scratchblocks2/blob/master/src/extra_strings.py) which aren't in Scratch itself (mainly the words used for the flag and arrow images). I'd be happy to accept pull requests for those!

# Usage

## MediaWiki

Use [the MediaWiki plugin](https://github.com/blob8108/mw-ScratchBlocks2). This is what the [Scratch Wiki](http://wiki.scratch.mit.edu/wiki/Block_Plugin) uses.

It doesn't support other languages yet. Sorry about that.

## WordPress

I found [a WordPress plugin](https://github.com/tkc49/scratchblocks-for-wp). It might work for you; I haven't tried it.

## Pandoc

Code Club use their own [lesson_format](https://github.com/CodeClub/lesson_format) tool to generate the PDF versions of their project guides. It uses the [pandoc_scratchblocks](https://github.com/CodeClub/pandoc_scratchblocks) plugin they wrote to make pictures of Scratch scripts.

This would probably be a good way to write a Scratch book.

## Markdown

By using [codeclub_lesson_builder](https://github.com/arve0/codeclub_lesson_builder) you can include scratch code directly in markdown codeblocks like this:

<pre>```blocks
when flag clicked
go to x:(-50) y:(0)
```
</pre>

The markdown builds to HTML and PDF.

## HTML

### A simple example

Have a look at the [example HTML
file](http://github.com/blob8108/scratchblocks2/blob/master/example.html),
which includes scratchblocks from GitHub Pages and jQuery from Google's CDN.

If you want to host the files yourself, read on.

### In more detail

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

### Inline blocks

To use blocks inside a paragraph...

```html
I'm rather fond of the <code class="b">stamp</code> block in Scratch.
```

...make a separate call to `parse` using the `inline` argument.

```js
scratchblocks2.parse("code.b", {inline: true});
```


# Development

See [`src/Dev-Readme.md`](https://github.com/blob8108/scratchblocks2/blob/master/src/Dev-Readme.md).


# Credits

* Plugin by blob8108
* Inspired by JSO's [Block Plugin](http://wiki.scratch.mit.edu/wiki/Block_Plugin_\(1.4\))
* Help with translation code from [joooni](http://scratch.mit.edu/users/joooni/)
* Block translations from the [Scratch translation server](http://translate.scratch.mit.edu/)
