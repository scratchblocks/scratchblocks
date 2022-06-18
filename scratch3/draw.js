/* for constucting SVGs */

// set by SVG.init
let document
let xml

const directProps = {
  textContent: true,
}

export default class SVG {
  static init(window) {
    document = window.document
    const DOMParser = window.DOMParser
    xml = new DOMParser().parseFromString("<xml></xml>", "application/xml")
    SVG.XMLSerializer = window.XMLSerializer
  }

  static makeCanvas() {
    return document.createElement("canvas")
  }

  static cdata(content) {
    return xml.createCDATASection(content)
  }

  static el(name, props) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", name)
    return SVG.setProps(el, props)
  }

  static setProps(el, props) {
    for (const key in props) {
      const value = "" + props[key]
      if (directProps[key]) {
        el[key] = value
      } else if (
        props[key] != null &&
        Object.prototype.hasOwnProperty.call(props, key)
      ) {
        el.setAttributeNS(null, key, value)
      }
    }
    return el
  }

  static withChildren(el, children) {
    for (const child of children) {
      el.appendChild(child)
    }
    return el
  }

  static group(children) {
    return SVG.withChildren(SVG.el("g"), children)
  }

  static newSVG(width, height, scale) {
    return SVG.el("svg", {
      version: "1.1",
      width: width * scale,
      height: height * scale,
      viewBox: `0 0 ${width * scale} ${height * scale}`,
    })
  }

  static polygon(props) {
    return SVG.el("polygon", { ...props, points: props.points.join(" ") })
  }

  static path(props) {
    return SVG.el("path", { ...props, path: null, d: props.path.join(" ") })
  }

  static text(x, y, content, props) {
    const text = SVG.el("text", { ...props, x: x, y: y, textContent: content })
    return text
  }

  static symbol(href) {
    return SVG.el("use", {
      href: href,
    })
  }

  static move(dx, dy, el) {
    SVG.setProps(el, {
      transform: `translate(${dx} ${dy})`,
    })
    return el
  }

  /* shapes */

  static rect(w, h, props) {
    return SVG.el("rect", { ...props, x: 0, y: 0, width: w, height: h })
  }

  static roundRect(w, h, props) {
    return SVG.rect(w, h, { ...props, rx: 4, ry: 4 })
  }

  static pillRect(w, h, props) {
    const r = h / 2
    return SVG.rect(w, h, { ...props, rx: r, ry: r })
  }

  static pointedPath(w, h) {
    const r = h / 2
    return [
      `M ${r} 0`,
      `L ${w - r} 0 ${w} ${r}`,
      `L ${w} ${r} ${w - r} ${h}`,
      `L ${r} ${h} 0 ${r}`,
      `L 0 ${r} ${r} 0`,
      "Z",
    ]
  }

  static pointedRect(w, h, props) {
    return SVG.path({ ...props, path: SVG.pointedPath(w, h) })
  }

  static topNotch(w, y) {
    return `c 2 0 3 1 4 2 l 4 4 c 1 1 2 2 4 2 h 12 c 2 0 3 -1 4 -2 l 4 -4 c 1 -1 2 -2 4 -2 L ${
      w - 4
    } ${y} a 4 4 0 0 1 4 4`
  }

  static getTop(w) {
    return `M 0 4 A 4 4 0 0 1 4 0 H 12 ${SVG.topNotch(w, 0)}`
  }

  static getRingTop(w) {
    return `M 0 3 L 3 0 L 7 0 L 10 3 L 16 3 L 19 0 L ${w - 3} 0 L ${w} 3`
  }

  static getRightAndBottom(w, y, hasNotch, inset) {
    if (typeof inset === "undefined") {
      inset = 0
    }

    let arr = [`L ${w} ${y - 4}`, `a 4 4 0 0 1 -4 4`]

    if (hasNotch) {
      arr = arr.concat([
        `L ${inset + 48} ${y}`,
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
  }

  static getArm(w, armTop) {
    return `L 16 ${armTop - 4} a 4 4 0 0 0 4 4 L 28 ${armTop} ${SVG.topNotch(
      w,
      armTop,
    )}`
  }

  static getArmNoNotch(w, armTop) {
    return `L 16 ${armTop - 4} a 4 4 0 0 0 4 4 L 28 ${armTop} L ${
      w - 4
    } ${armTop} a 4 4 0 0 1 4 4`
  }

  static stackRect(w, h, props) {
    return SVG.path({
      ...props,
      path: [SVG.getTop(w), SVG.getRightAndBottom(w, h, true, 0), "Z"],
    })
  }

  static capPath(w, h) {
    return [SVG.getTop(w), SVG.getRightAndBottom(w, h, false, 0), "Z"]
  }

  static capRect(w, h, props) {
    return SVG.path({ ...props, path: SVG.capPath(w, h) })
  }

  static getHatTop(w) {
    return `M 0 16 c 25,-22 71,-22 96,0 L ${w - 4} 16 a 4 4 0 0 1 4 4`
  }

  static getCatTop(w) {
    return `M 0 32 c2.6,-2.3 5.5,-4.3 8.5,-6.2c-1,-12.5 5.3,-23.3 8.4,-24.8c3.7,-1.8 \
16.5,13.1 18.4,15.4c8.4,-1.3 17,-1.3 25.4,0c1.9,-2.3 14.7,-17.2 18.4,-15.4c3.1,1.5 \
9.4,12.3 8.4,24.8c3,1.8 5.9,3.9 8.5,6.1 L ${w - 4} 32 a 4 4 0 0 1 4 4`
  }

  static hatRect(w, h, props) {
    return SVG.path({
      ...props,
      path: [SVG.getHatTop(w), SVG.getRightAndBottom(w, h, true, 0), "Z"],
    })
  }

  static catHat(w, h, props) {
    return SVG.group([
      SVG.path({
        ...props,
        path: [SVG.getCatTop(w), SVG.getRightAndBottom(w, h, true, 0), "Z"],
      }),
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
              d: "M45.6,0.1c-0.9,0-1.7-0.3-2.3-0.9c-0.6,0.6-1.3,0.9-2.2,0.9c-0.9,0-1.8-0.3-2.3-0.9c-1-1.1-1.1-2.6-1.1-2.8c0-0.5,0.5-1,1-1l0,0c0.6,0,1,0.5,1,1c0,0.4,0.1,1.7,1.4,1.7c0.5,0,0.7-0.2,0.8-0.3c0.3-0.3,0.4-1,0.4-1.3c0-0.1,0-0.1,0-0.2c0-0.5,0.5-1,1-1l0,0c0.5,0,1,0.4,1,1c0,0,0,0.1,0,0.2c0,0.3,0.1,0.9,0.4,1.2C44.8-2.2,45-2,45.5-2s0.7-0.2,0.8-0.3c0.3-0.4,0.4-1.1,0.3-1.3c0-0.5,0.4-1,0.9-1.1c0.5,0,1,0.4,1.1,0.9c0,0.2,0.1,1.8-0.8,2.8C47.5-0.4,46.8,0.1,45.6,0.1z",
            }),
          ]),
          {
            fill: "#000",
            "fill-opacity": 0.6,
          },
        ),
      ),
      SVG.move(
        0,
        32,
        SVG.el("path", {
          d: "M73.1-15.6c1.7-4.2,4.5-9.1,5.8-8.5c1.6,0.8,5.4,7.9,5,15.4c0,0.6-0.7,0.7-1.1,0.5c-3-1.6-6.4-2.8-8.6-3.6C72.8-12.3,72.4-13.7,73.1-15.6z",
          fill: "#FFD5E6",
          transform: "translate(0, 32)",
        }),
      ),
      SVG.move(
        0,
        32,
        SVG.el("path", {
          d: "M22.4-15.6c-1.7-4.2-4.5-9.1-5.8-8.5c-1.6,0.8-5.4,7.9-5,15.4c0,0.6,0.7,0.7,1.1,0.5c3-1.6,6.4-2.8,8.6-3.6C22.8-12.3,23.2-13.7,22.4-15.6z",
          fill: "#FFD5E6",
          transform: "translate(0, 32)",
        }),
      ),
    ])
  }

  static getProcHatTop(w) {
    return `M 0 20 a 20 20 0 0 1 20 -20 L ${w - 20} 0 a 20,20 0 0,1 20,20`
  }

  static procHatRect(w, h, props) {
    return SVG.path({
      ...props,
      path: [SVG.getProcHatTop(w), SVG.getRightAndBottom(w, h, true, 0), "Z"],
    })
  }

  static mouthRect(w, h, isFinal, lines, props) {
    let y = lines[0].height
    const p = [SVG.getTop(w), SVG.getRightAndBottom(w, y, true, 16)]
    for (let i = 1; i < lines.length; i += 2) {
      const isLast = i + 2 === lines.length

      const line = lines[i]
      y += line.height - 3

      if (line.isFinal) {
        p.push(SVG.getArmNoNotch(w, y))
      } else {
        p.push(SVG.getArm(w, y))
      }

      const hasNotch = !(isLast && isFinal)
      const inset = isLast ? 0 : 16
      y += lines[i + 1].height + 3
      p.push(SVG.getRightAndBottom(w, y, hasNotch, inset))
    }
    p.push("Z")
    return SVG.path({ ...props, path: p })
  }

  static commentRect(w, h, props) {
    return SVG.roundRect(w, h, { ...props, class: "sb3-comment" })
  }

  static commentLine(width, props) {
    return SVG.move(
      -width,
      9,
      SVG.rect(width, 2, { ...props, class: "sb3-comment-line" }),
    )
  }

  static strikethroughLine(w, props) {
    return SVG.path({
      ...props,
      path: ["M", 0, 0, "L", w, 0],
      class: "sb3-diff sb3-diff-del",
    })
  }
}
