/*
 * scratchblocks
 * http://scratchblocks.github.io/
 *
 * Copyright 2013-2016, Tim Radvan
 * @license MIT
 * http://opensource.org/licenses/MIT
 */
module.exports = function(window) {
  "use strict"

  var document = window.document

  /* utils */

  /*****************************************************************************/

  const syntax = require("./syntax")
  const {
    allLanguages,
    loadLanguages,

    Label,
    Icon,
    Input,
    Block,
    Comment,
    Script,
    Document,
  } = syntax

  /*****************************************************************************/

  var scratch2 = require("./scratch2")
  scratch2.init(window)

  var scratch3 = require("./scratch3")
  scratch3.init(window)

  function appendStyles() {
    document.head.appendChild(scratch2.makeStyle())
    document.head.appendChild(scratch3.makeStyle())
  }

  function parse(code, options) {
    return syntax.parse(code, options)
  }

  function newView(doc, options) {
    var options = Object.assign(
      {
        style: "scratch2",
      },
      options
    )
    switch (options.style) {
      case "scratch2":
        return scratch2.newView(doc)
      case "scratch3":
        return scratch3.newView(doc)
      default:
        throw new Error("Unknown style: " + options.style)
    }
  }

  function render(doc, options) {
    if (typeof options === "function") {
      throw new Error("render() no longer takes a callback")
    }
    var view = newView(doc, options)
    var svg = view.render()
    return svg
  }

  /*****************************************************************************/

  /*** Render ***/

  // read code from a DOM element
  function readCode(el, options) {
    var options = Object.assign(
      {
        inline: false,
      },
      options
    )

    var html = el.innerHTML.replace(/<br>\s?|\n|\r\n|\r/gi, "\n")
    var pre = document.createElement("pre")
    pre.innerHTML = html
    var code = pre.textContent
    if (options.inline) {
      code = code.replace("\n", "")
    }
    return code
  }

  // insert 'svg' into 'el', with appropriate wrapper elements
  function replace(el, svg, doc, options) {
    if (options.inline) {
      var container = document.createElement("span")
      var cls = "scratchblocks scratchblocks-inline"
      if (doc.scripts[0] && !doc.scripts[0].isEmpty) {
        cls += " scratchblocks-inline-" + doc.scripts[0].blocks[0].shape
      }
      container.className = cls
      container.style.display = "inline-block"
      container.style.verticalAlign = "middle"
    } else {
      var container = document.createElement("div")
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
  var renderMatching = function(selector, options) {
    var selector = selector || "pre.blocks"
    var options = Object.assign(
      {
        style: "scratch2",
        inline: false,
        languages: ["en"],

        read: readCode, // function(el, options) => code
        parse: parse, // function(code, options) => doc
        render: render, // function(doc) => svg
        replace: replace, // function(el, svg, doc, options)
      },
      options
    )

    // find elements
    var results = [].slice.apply(document.querySelectorAll(selector))
    results.forEach(function(el) {
      var code = options.read(el, options)

      var doc = options.parse(code, options)

      var svg = options.render(doc, options)

      options.replace(el, svg, doc, options)
    })
  }

  return {
    allLanguages: allLanguages, // read-only
    loadLanguages: loadLanguages,

    stringify: function(doc) {
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
    replace: replace,
    render: render,
    renderMatching: renderMatching,

    appendStyles: appendStyles,
  }
}
