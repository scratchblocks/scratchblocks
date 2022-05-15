Make pictures of Scratch blocks from text.

[![Screenshot](https://scratchblocks.github.io/screenshot.png)](https://scratchblocks.github.io/#when%20flag%20clicked%0Aclear%0Aforever%0Apen%20down%0Aif%20%3C%3Cmouse%20down%3F%3E%20and%20%3Ctouching%20%5Bmouse-pointer%20v%5D%3F%3E%3E%20then%0Aswitch%20costume%20to%20%5Bbutton%20v%5D%0Aelse%0Aadd%20(x%20position)%20to%20%5Blist%20v%5D%0Aend%0Amove%20(foo)%20steps%0Aturn%20ccw%20(9)%20degrees)

**[Try it out!](https://scratchblocks.github.io/)**

---

**scratchblocks** is used to write Scratch scripts:

- in [Scratch Forum](https://scratch.mit.edu/discuss/topic/14772/) posts
- in [Scratch Wiki](https://en.scratch-wiki.info/wiki/Block_Plugin) articles
- in the [Code Club](https://www.codeclub.org.uk) project guides

It's MIT licensed, so you can use it in your projects.
(But do send me a link [on Twitter](https://twitter.com/blob8108)!)

For the full guide to the syntax, see [the wiki](https://en.scratch-wiki.info/wiki/Block_Plugin/Syntax).

# Usage

## MediaWiki

Use [the MediaWiki plugin](https://github.com/InternationalScratchWiki/mw-ScratchBlocks4).
(This is what the [Scratch Wiki](https://en.scratch-wiki.info/wiki/Block_Plugin) uses.)

## WordPress

I found [a WordPress plugin](https://github.com/tkc49/scratchblocks-for-wp).
It might work for you; I haven't tried it.

## Pandoc

Code Club use their own [lesson_format](https://github.com/CodeClub/lesson_format) tool to generate the PDF versions of their project guides.
It uses the [pandoc_scratchblocks](https://github.com/CodeClub/pandoc_scratchblocks) plugin they wrote to make pictures of Scratch scripts.

This would probably be a good way to write a Scratch book.

## HTML

You'll need to include a copy of the scratchblocks JS file on your webpage.
There are a few ways of getting one:

* Download it from the <https://github.com/scratchblocks/scratchblocks/releases> page
* If you have a fancy JS build system, you might like to include the `scratchblocks` package from NPM
* You could clone this repository and build it yourself using Node (`npm run build`).

```html
<script src="scratchblocks-min.js"></script>
```

The convention is to write scratchblocks inside `pre` tags with the class `blocks`:
```html
<pre class="blocks">
when flag clicked
move (10) steps
</pre>
```

You then need to call `scratchblocks.renderMatching` after the page has loaded.
Make sure this appears at the end of the page (just before the closing `</body>` tag):
```js
<script>
scratchblocks.renderMatching('pre.blocks', {
  style:     'scratch3',   // Optional, defaults to 'scratch2'.
  languages: ['en', 'de'], // Optional, defaults to ['en'].
  scale: 1,                // Optional, defaults to 1
});
</script>
```
The `renderMatching()` function takes a CSS-style selector for the elements that contain scratchblocks code: we use `pre.blocks` to target `pre` tags with the class `blocks`.

The `style` option controls how the blocks appear, either the Scratch 2 or Scratch 3 style is supported.

### Inline blocks

You might also want to use blocks "inline", inside a paragraph:
```html
I'm rather fond of the <code class="b">stamp</code> block in Scratch.
```

To allow this, make a second call to `renderMatching` using the `inline` argument.
```js
<script>
scratchblocks.renderMatching("pre.blocks", ...)

scratchblocks.renderMatching("code.b", {
  inline: true,
  // Repeat `style` and `languages` options here.
});
</script>
```
This time we use `code.b` to target `code` blocks with the class `b`.

### Translations

If you want to use languages other than English, you'll need to include a second JS file that contains translations.
The releases page includes two options; you can pick one:

* `translations.js` includes a limited set of languages, as seen on the Scratch Forums
* `translations-all.js` includes every langauge that Scratch supports.

The translations files are hundreds of kilobytes in size, so to keep your page bundle size down you might like to build your own file with just the languages you need.

For example, a translations file that just loads the German language (ISO code `de`) would look something like this:
```js
window.scratchblocks.loadLanguages({
    de: <contents of locales/de.json>
})
```

If you're using a JavaScript bundler you should be able to build your own translations file by calling `require()` with the path to the locale JSON file.
This requires your bundler to allow importing JSON files as JavaScript.
```js
window.scratchblocks.loadLanguages({
    de: require('scratchblocks/locales/de.json'),
})
```

## NPM

The `scratchblocks` package is published on NPM, and you can use it with browserify and other bundlers, if you're into that sort of thing.

Once you've got browserify set up to build a client-side bundle from your app
code, you can just add `scratchblocks` to your dependencies, and everything
should Just Work™.

```js
var scratchblocks = require('scratchblocks');
scratchblocks.renderMatching('pre.blocks');
```

## ESM Support
Since version 3.6.0, scratchblocks can be properly loaded as an ESM module. The ESM version, instead of defining `window.scratchblocks`, default-exports the `scratchblocks` object. Similarly, the JavaScript translation files default-exports a function to load the translations.

```js
import scratchblocks from "./scratchblocks-es-min.js";
import loadTranslations from "./translations-all-es.js";
loadTranslations(scratchblocks);

// window.scratchblocks is NOT available!
```

# Languages

To update the translations:
```sh
npm upgrade scratch-l10n
npm run locales
```

## Adding a language

Each language **requires** some [additional words](https://github.com/scratchblocks/scratchblocks/blob/master/locales-src/extra_aliases.js) which aren't in Scratch itself (mainly the words used for the flag and arrow images).
I'd be happy to accept pull requests for those! You'll need to rebuild the translations with `npm run locales` after editing the aliases.

# Development

This should set you up and start a http-server for development:

```
npm install
npm start
```

Then open <http://localhost:8000/> :-)

For more details, see [`CONTRIBUTING.md`](https://github.com/scratchblocks/scratchblocks/blob/master/.github/CONTRIBUTING.md).


# Credits

Many, many thanks to the [contributors](https://github.com/scratchblocks/scratchblocks/graphs/contributors)!

* Authored by [tjvr](https://github.com/tjvr)
* Maintained by tjvr and [apple502j](https://github.com/apple502j)
* Icons derived from [Scratch Blocks](https://github.com/LLK/scratch-blocks) (Apache License 2.0)
* Scratch 2 SVG proof-of-concept, shapes & filters by [as-com](https://github.com/as-com)
* Anna helped with a formula, and pointed out that I can't read graphs
* JSO designed the syntax and wrote the original [Block Plugin](https://en.scratch-wiki.info/wiki/Block_Plugin_\(1.4\))
* Help with translation code from [joooni](https://scratch.mit.edu/users/joooni/)
* Block translations from the [scratch-l10n repository](https://github.com/LLK/scratch-l10n/)
* Ported to node by [arve0](https://github.com/arve0)
