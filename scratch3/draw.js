/* for constucting SVGs */

function extend(src, dest) {
  return Object.assign({}, src, dest)
}
function assert(bool, message) {
  if (!bool) throw "Assertion failed! " + (message || "")
}

// set by SVG.init
var document
var xml

var directProps = {
  textContent: true,
}

var SVG = (module.exports = {
  init(window) {
    document = window.document
    var DOMParser = window.DOMParser
    xml = new DOMParser().parseFromString("<xml></xml>", "application/xml")
    SVG.XMLSerializer = window.XMLSerializer
  },

  makeCanvas() {
    return document.createElement("canvas")
  },

  cdata(content) {
    return xml.createCDATASection(content)
  },

  el(name, props) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", name)
    return SVG.setProps(el, props)
  },

  setProps(el, props) {
    for (var key in props) {
      var value = "" + props[key]
      if (directProps[key]) {
        el[key] = value
      } else if (/^xlink:/.test(key)) {
        el.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value)
      } else if (props[key] !== null && props.hasOwnProperty(key)) {
        el.setAttributeNS(null, key, value)
      }
    }
    return el
  },

  withChildren(el, children) {
    for (var i = 0; i < children.length; i++) {
      el.appendChild(children[i])
    }
    return el
  },

  group(children) {
    return SVG.withChildren(SVG.el("g"), children)
  },

  newSVG(width, height) {
    return SVG.el("svg", {
      version: "1.1",
      width: width,
      height: height,
      viewBox: `0 0 ${width} ${height}`,
    })
  },

  polygon(props) {
    return SVG.el(
      "polygon",
      extend(props, {
        points: props.points.join(" "),
      })
    )
  },

  path(props) {
    return SVG.el(
      "path",
      extend(props, {
        path: null,
        d: props.path.join(" "),
      })
    )
  },

  text(x, y, content, props) {
    var text = SVG.el(
      "text",
      extend(props, {
        x: x,
        y: y,
        textContent: content,
      })
    )
    return text
  },

  symbol(href) {
    return SVG.el("use", {
      "xlink:href": href,
    })
  },

  move(dx, dy, el) {
    SVG.setProps(el, {
      transform: ["translate(", dx, " ", dy, ")"].join(""),
    })
    return el
  },

  /* shapes */

  rect(w, h, props) {
    return SVG.el(
      "rect",
      extend(props, {
        x: 0,
        y: 0,
        width: w,
        height: h,
      })
    )
  },

  roundRect(w, h, props) {
    return SVG.rect(
      w,
      h,
      extend(props, {
        rx: 4,
        ry: 4,
      })
    )
  },

  pillRect(w, h, props) {
    var r = h / 2
    return SVG.rect(
      w,
      h,
      extend(props, {
        rx: r,
        ry: r,
      })
    )
  },

  pointedPath(w, h) {
    var r = h / 2
    return [
      ["M", r, 0].join(" "),
      ["L", w - r, 0, w, r].join(" "),
      ["L", w, r, w - r, h].join(" "),
      ["L", r, h, 0, r].join(" "),
      ["L", 0, r, r, 0].join(" "),
      "Z",
    ]
  },

  pointedRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: SVG.pointedPath(w, h),
      })
    )
  },

  topNotch(w, y) {
    return [
      "c 2 0 3 1 4 2",
      "l 4 4",
      "c 1 1 2 2 4 2",
      "h 12",
      "c 2 0 3 -1 4 -2",
      "l 4 -4",
      "c 1 -1 2 -2 4 -2",
      ["L", w - 4, y].join(" "),
      "a 4 4 0 0 1 4 4",
    ].join(" ")
  },

  getTop(w) {
    return ["M 0 4", "A 4 4 0 0 1 4 0", "H 12", SVG.topNotch(w, 0)].join(" ")
  },

  getRingTop(w) {
    return [
      "M",
      0,
      3,
      "L",
      3,
      0,
      "L",
      7,
      0,
      "L",
      10,
      3,
      "L",
      16,
      3,
      "L",
      19,
      0,
      "L",
      w - 3,
      0,
      "L",
      w,
      3,
    ].join(" ")
  },

  getRightAndBottom(w, y, hasNotch, inset) {
    if (typeof inset === "undefined") {
      inset = 0
    }

    var arr = [["L", w, y - 4].join(" "), ["a", 4, 4, 0, 0, 1, -4, 4].join(" ")]

    if (hasNotch) {
      arr = arr.concat([
        ["L", inset + 48, y].join(" "),
        "c -2 0 -3 1 -4 2",
        "l -4 4",
        "c -1 1 -2 2 -4 2",
        "h -12",
        "c -2 0 -3 -1 -4 -2",
        "l -4 -4",
        "c -1 -1 -2 -2 -4 -2",
      ])
    }
    if (inset === 0) {
      arr.push("L", inset + 4, y)
      arr.push("a 4 4 0 0 1 -4 -4")
    } else {
      arr.push("L", inset + 4, y)
      arr.push("a 4 4 0 0 0 -4 4")
    }
    return arr.join(" ")
  },

  getArm(w, armTop) {
    return [
      ["L", 16, armTop - 4].join(" "),
      "a 4 4 0 0 0 4 4",
      ["L", 28, armTop].join(" "),
      SVG.topNotch(w, armTop),
    ].join(" ")
  },

  getArmNoNotch(w, armTop) {
    return [
      ["L", 16, armTop - 4].join(" "),
      "a 4 4 0 0 0 4 4",
      ["L", 28, armTop].join(" "),
      ["L", w - 4, armTop].join(" "),
      "a 4 4 0 0 1 4 4",
    ].join(" ")
  },

  stackRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: [SVG.getTop(w), SVG.getRightAndBottom(w, h, true, 0), "Z"],
      })
    )
  },

  capPath(w, h) {
    return [SVG.getTop(w), SVG.getRightAndBottom(w, h, false, 0), "Z"]
  },

  ringCapPath(w, h) {
    return [SVG.getRingTop(w), SVG.getRightAndBottom(w, h, false, 0), "Z"]
  },

  capRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: SVG.capPath(w, h),
      })
    )
  },

  getHatTop(w) {
    return [
      "M 0 16",
      "c 25,-22 71,-22 96,0",
      ["L", w - 4, 16].join(" "),
      "a 4 4 0 0 1 4 4",
    ].join(" ")
  },

  getCatTop(w) {
    return [
      "M 0 32",
      "c2.6,-2.3 5.5,-4.3 8.5,-6.2c-1,-12.5 5.3,-23.3 8.4,-24.8c3.7,-1.8 16.5,13.1 18.4,15.4c8.4,-1.3 17,-1.3 25.4,0c1.9,-2.3 14.7,-17.2 18.4,-15.4c3.1,1.5 9.4,12.3 8.4,24.8c3,1.8 5.9,3.9 8.5,6.1",
      ["L", w - 4, 32].join(" "),
      "a 4 4 0 0 1 4 4",
    ].join(" ")
  },

  hatRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: [SVG.getHatTop(w), SVG.getRightAndBottom(w, h, true, 0), "Z"],
      })
    )
  },

  catHat(w, h, props) {
    return SVG.group([
      SVG.path(
        extend(props, {
          path: [SVG.getCatTop(w), SVG.getRightAndBottom(w, h, true, 0), "Z"],
        })
      ),
      SVG.move(
        0,
        32,
        SVG.setProps(
          SVG.group([
            SVG.el("circle", {
              cx: 29.1,
              cy: -3.3,
              r: 3.4,
            }),
            SVG.el("circle", {
              cx: 59.2,
              cy: -3.3,
              r: 3.4,
            }),
            SVG.el("path", {
              d:
                "M45.6,0.1c-0.9,0-1.7-0.3-2.3-0.9c-0.6,0.6-1.3,0.9-2.2,0.9c-0.9,0-1.8-0.3-2.3-0.9c-1-1.1-1.1-2.6-1.1-2.8c0-0.5,0.5-1,1-1l0,0c0.6,0,1,0.5,1,1c0,0.4,0.1,1.7,1.4,1.7c0.5,0,0.7-0.2,0.8-0.3c0.3-0.3,0.4-1,0.4-1.3c0-0.1,0-0.1,0-0.2c0-0.5,0.5-1,1-1l0,0c0.5,0,1,0.4,1,1c0,0,0,0.1,0,0.2c0,0.3,0.1,0.9,0.4,1.2C44.8-2.2,45-2,45.5-2s0.7-0.2,0.8-0.3c0.3-0.4,0.4-1.1,0.3-1.3c0-0.5,0.4-1,0.9-1.1c0.5,0,1,0.4,1.1,0.9c0,0.2,0.1,1.8-0.8,2.8C47.5-0.4,46.8,0.1,45.6,0.1z",
            }),
          ]),
          {
            fill: "#000",
            "fill-opacity": 0.6,
          }
        )
      ),
      SVG.move(
        0,
        32,
        SVG.el("path", {
          d:
            "M73.1-15.6c1.7-4.2,4.5-9.1,5.8-8.5c1.6,0.8,5.4,7.9,5,15.4c0,0.6-0.7,0.7-1.1,0.5c-3-1.6-6.4-2.8-8.6-3.6C72.8-12.3,72.4-13.7,73.1-15.6z",
          fill: "#FFD5E6",
          transform: "translate(0, 32)",
        })
      ),
      SVG.move(
        0,
        32,
        SVG.el("path", {
          d:
            "M22.4-15.6c-1.7-4.2-4.5-9.1-5.8-8.5c-1.6,0.8-5.4,7.9-5,15.4c0,0.6,0.7,0.7,1.1,0.5c3-1.6,6.4-2.8,8.6-3.6C22.8-12.3,23.2-13.7,22.4-15.6z",
          fill: "#FFD5E6",
          transform: "translate(0, 32)",
        })
      ),
    ])
  },

  getProcHatTop(w) {
    return [
      "M 0 20",
      "a 20 20 0 0 1 20 -20",
      ["L", w - 20, 0].join(" "),
      "a 20,20 0 0,1 20,20",
    ].join(" ")
  },

  procHatRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: [SVG.getProcHatTop(w), SVG.getRightAndBottom(w, h, true, 0), "Z"],
      })
    )
  },

  mouthRect(w, h, isFinal, lines, props) {
    var y = lines[0].height
    var p = [SVG.getTop(w), SVG.getRightAndBottom(w, y, true, 16)]
    for (var i = 1; i < lines.length; i += 2) {
      var isLast = i + 2 === lines.length

      var line = lines[i]
      y += line.height - 3

      if (line.isFinal) {
        p.push(SVG.getArmNoNotch(w, y))
      } else {
        p.push(SVG.getArm(w, y))
      }

      var hasNotch = !(isLast && isFinal)
      var inset = isLast ? 0 : 16
      y += lines[i + 1].height + 3
      p.push(SVG.getRightAndBottom(w, y, hasNotch, inset))
    }
    p.push("Z")
    return SVG.path(
      extend(props, {
        path: p,
      })
    )
  },

  commentRect(w, h, props) {
    var r = 6
    return SVG.roundRect(
      w,
      h,
      extend(props, {
        class: "sb3-comment",
      })
    )
  },

  commentLine(width, props) {
    return SVG.move(
      -width,
      9,
      SVG.rect(
        width,
        2,
        extend(props, {
          class: "sb3-comment-line",
        })
      )
    )
  },

  strikethroughLine(w, props) {
    return SVG.path(
      extend(props, {
        path: ["M", 0, 0, "L", w, 0],
        class: "sb3-diff sb3-diff-del",
      })
    )
  },
})
