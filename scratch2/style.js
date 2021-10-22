var SVG = require("./draw.js")
var Filter = require("./filter.js")
var cssContent = require("./style.css.js")

var Style = (module.exports = {
  cssContent: cssContent,

  makeIcons() {
    return [
      SVG.el("path", {
        d: "M1.504 21L0 19.493 4.567 0h1.948l-.5 2.418s1.002-.502 3.006 0c2.006.503 3.008 2.01 6.517 2.01 3.508 0 4.463-.545 4.463-.545l-.823 9.892s-2.137 1.005-5.144.696c-3.007-.307-3.007-2.007-6.014-2.51-3.008-.502-4.512.503-4.512.503L1.504 21z",
        fill: "#3f8d15",
        id: "greenFlag",
      }),
      SVG.el("polygon", {
        points:
          "6.3,0.4725 12.516,0.4725 18.585,6.3 18.585,12.495 12.495,18.585 6.3,18.585 0.483,12.495 0.483,6.3  ",
        fill: "#bb0010",
        id: "stopSign",
      }),
      SVG.el("path", {
        d: "M6.724 0C3.01 0 0 2.91 0 6.5c0 2.316 1.253 4.35 3.14 5.5H5.17v-1.256C3.364 10.126 2.07 8.46 2.07 6.5 2.07 4.015 4.152 2 6.723 2c1.14 0 2.184.396 2.993 1.053L8.31 4.13c-.45.344-.398.826.11 1.08L15 8.5 13.858.992c-.083-.547-.514-.714-.963-.37l-1.532 1.172A6.825 6.825 0 0 0 6.723 0z",
        fill: "#fff",
        id: "turnRight",
      }),
      SVG.el("path", {
        d: "M3.637 1.794A6.825 6.825 0 0 1 8.277 0C11.99 0 15 2.91 15 6.5c0 2.316-1.253 4.35-3.14 5.5H9.83v-1.256c1.808-.618 3.103-2.285 3.103-4.244 0-2.485-2.083-4.5-4.654-4.5-1.14 0-2.184.396-2.993 1.053L6.69 4.13c.45.344.398.826-.11 1.08L0 8.5 1.142.992c.083-.547.514-.714.963-.37l1.532 1.172z",
        fill: "#fff",
        id: "turnLeft",
      }),
      SVG.el("path", {
        d: "M0 0L4 4L0 8Z",
        fill: "#111",
        id: "addInput",
      }),
      SVG.el("path", {
        d: "M4 0L4 8L0 4Z",
        fill: "#111",
        id: "delInput",
      }),
      SVG.setProps(
        SVG.group([
          SVG.el("path", {
            d: "M8 0l2 -2l0 -3l3 0l-4 -5l-4 5l3 0l0 3l-8 0l0 2",
            fill: "#000",
            opacity: "0.3",
          }),
          SVG.move(
            -1,
            -1,
            SVG.el("path", {
              d: "M8 0l2 -2l0 -3l3 0l-4 -5l-4 5l3 0l0 3l-8 0l0 2",
              fill: "#fff",
              opacity: "0.9",
            })
          ),
        ]),
        {
          id: "loopArrow",
        }
      ),
      SVG.setProps(
        SVG.group([
          SVG.el("rect", {
            x: "0",
            y: "0",
            width: "12",
            height: "14",
            fill: "#000",
            opacity: "0.25",
          }),
          SVG.el("rect", {
            x: "1",
            y: "1",
            width: "1",
            height: "13",
            fill: "#fff",
          }),
          SVG.el("rect", {
            x: "11",
            y: "1",
            width: "1",
            height: "13",
            fill: "#fff",
          }),
          SVG.el("rect", {
            x: "2",
            y: "1",
            width: "9",
            height: "1",
            fill: "#fff",
          }),
          SVG.el("rect", {
            x: "2",
            y: "5",
            width: "9",
            height: "1",
            fill: "#fff",
          }),
          SVG.el("rect", {
            x: "2",
            y: "9",
            width: "9",
            height: "1",
            fill: "#fff",
          }),
          SVG.el("rect", {
            x: "2",
            y: "13",
            width: "9",
            height: "1",
            fill: "#fff",
          }),
          SVG.el("rect", {
            x: "2",
            y: "2",
            width: "9",
            height: "2",
            fill: "#ea8d1c",
          }),
          SVG.el("rect", {
            x: "2",
            y: "6",
            width: "9",
            height: "2",
            fill: "#ea8d1c",
          }),
          SVG.el("rect", {
            x: "2",
            y: "10",
            width: "9",
            height: "2",
            fill: "#ea8d1c",
          }),
          SVG.el("rect", {
            x: "11",
            y: "0",
            width: "1",
            height: "1",
            fill: "#ea8d1c",
          }),
          SVG.el("rect", {
            x: "0",
            y: "13",
            width: "1",
            height: "1",
            fill: "#ea8d1c",
          }),
        ]),
        {
          id: "list",
        }
      ),
    ]
  },

  makeStyle() {
    var style = SVG.el("style")
    style.appendChild(SVG.cdata(Style.cssContent))
    return style
  },

  bevelFilter(id, inset) {
    var f = new Filter(id)

    var alpha = "SourceAlpha"
    var s = inset ? -1 : 1
    var blur = f.blur(1, alpha)

    f.merge([
      "SourceGraphic",
      f.comp(
        "in",
        f.flood("#fff", 0.15),
        f.subtract(alpha, f.offset(+s, +s, blur))
      ),
      f.comp(
        "in",
        f.flood("#000", 0.7),
        f.subtract(alpha, f.offset(-s, -s, blur))
      ),
    ])

    return f.el
  },

  darkFilter(id) {
    var f = new Filter(id)

    f.merge([
      "SourceGraphic",
      f.comp("in", f.flood("#000", 0.2), "SourceAlpha"),
    ])

    return f.el
  },

  darkRect(w, h, category, el) {
    return SVG.setProps(
      SVG.group([
        SVG.setProps(el, {
          class: ["sb-" + category, "sb-darker"].join(" "),
        }),
      ]),
      { width: w, height: h }
    )
  },

  defaultFontFamily: "Lucida Grande, Verdana, Arial, DejaVu Sans, sans-serif",
})
