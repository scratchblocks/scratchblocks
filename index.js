/*
 * scratchblocks
 * http://scratchblocks.github.io/
 *
 * Copyright 2013-2016, Tim Radvan
 * @license MIT
 * http://opensource.org/licenses/MIT
 */
import {
  parse,
  allLanguages,
  loadLanguages,
  Label,
  Icon,
  Input,
  Block,
  Comment,
  Script,
  Document,
  movedExtensions,
  extensions,
} from "./syntax/index.js"
import * as scratch2 from "./scratch2/index.js"
import * as scratch3 from "./scratch3/index.js"
import Style from "./scratch3/style.js"
import { overrideCategories } from "./syntax/blocks.js"

export default function (window) {
  const document = window.document
  let styles = [];

  scratch2.init(window)
  scratch3.init(window)

  function appendStyles() {
    styles.forEach(i => document.head.removeChild(i))
    const newStyles = [scratch2.makeStyle(), scratch3.makeStyle()]
    newStyles.forEach(i => document.head.appendChild(i))
    styles = newStyles;
  }

  function appendExtension(info) {
    if (!extensions[info.id]) {
      movedExtensions[info.id] = info.id;
      extensions[info.id] = info.id;
      overrideCategories.push(info.id);

      Style.setExtensionIcons(info);
      appendStyles();
    }
  }

  function newView(doc, options) {
    options = {
      style: "scratch2",
      ...options,
    }

    options.scale = options.scale || 1

    if (options.style === "scratch2") {
      return scratch2.newView(doc, options)
    } else if (/^scratch3($|-)/.test(options.style)) {
      return scratch3.newView(doc, options)
    }

    throw new Error(`Unknown style: ${options.style}`)
  }

  function render(doc, options) {
    if (typeof options === "function") {
      throw new Error("render() no longer takes a callback")
    }
    const view = newView(doc, options)
    const svg = view.render()
    // Used in high contrast theme
    svg.classList.add(`scratchblocks-style-${options.style}`)
    return svg
  }

  /*****************************************************************************/

  /*** Render ***/

  // read code from a DOM element
  function readCode(el, options) {
    options = {
      inline: false,
      ...options,
    }

    const html = el.innerHTML.replace(/<br>\s?|\n|\r\n|\r/gi, "\n")
    const pre = document.createElement("pre")
    pre.innerHTML = html
    let code = pre.textContent
    if (options.inline) {
      code = code.replace("\n", "")
    }
    return code
  }

  // insert 'svg' into 'el', with appropriate wrapper elements
  function replace(el, svg, doc, options) {
    let container
    if (options.inline) {
      container = document.createElement("span")
      let cls = "scratchblocks scratchblocks-inline"
      if (doc.scripts[0] && !doc.scripts[0].isEmpty) {
        cls += ` scratchblocks-inline-${doc.scripts[0].blocks[0].shape}`
      }
      container.className = cls
      container.style.display = "inline-block"
      container.style.verticalAlign = "middle"
    } else {
      container = document.createElement("div")
      container.className = "scratchblocks"
    }
    container.appendChild(svg)

    el.innerHTML = ""
    el.appendChild(container)
  }

  /* Render all matching elements in page to shiny scratch blocks.
   * Accepts a CSS selector as an argument.
   *
   *  scratchblocks.renderMatching("pre.blocks");
   *
   * Like the old 'scratchblocks2.parse().
   */
  const renderMatching = function (selector, options) {
    selector = selector || "pre.blocks"
    options = {
      // Default values for the options
      style: "scratch2",
      inline: false,
      languages: ["en"],
      scale: 1,

      read: readCode, // function(el, options) => code
      parse: parse, // function(code, options) => doc
      render: render, // function(doc) => svg
      replace: replace, // function(el, svg, doc, options)

      ...options,
    }

    // find elements
    const results = [].slice.apply(document.querySelectorAll(selector))
    results.forEach(el => {
      const code = options.read(el, options)

      const doc = options.parse(code, options)

      const svg = options.render(doc, options)

      options.replace(el, svg, doc, options)
    })
  }

  return {
    allLanguages: allLanguages, // read-only
    loadLanguages: loadLanguages,

    stringify: function (doc) {
      return doc.stringify()
    },

    Label,
    Icon,
    Input,
    Block,
    Comment,
    Script,
    Document,

    newView: newView,
    read: readCode,
    parse: parse,
    appendExtension: appendExtension,
    replace: replace,
    render: render,
    renderMatching: renderMatching,

    appendStyles: appendStyles,
  }
}
