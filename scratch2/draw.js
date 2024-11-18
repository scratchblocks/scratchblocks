/* for constructing SVGs */

function assert(bool, message) {
  if (!bool) {
    throw new Error(`Assertion failed! ${message || ""}`)
  }
}

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
      const value = String(props[key])
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
      viewBox: `0 0 ${width} ${height}`,
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

  // translatePath takes a path string such as "M 0 0 L 0 10 L 10 0 Z", fins
  // the individual X/Y components, and translates them by dx/dy, so as to
  // "move" the path.
  //
  // This is not a particularly good way of doing this, but given we control
  // the inputs to it it works well enough I guess?
  static translatePath(dx, dy, path) {
    let isX = true
    const parts = path.split(/\s+/)
    const out = []
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]
      if (part === "A") {
        const j = i + 5
        out.push("A")
        while (i < j) {
          out.push(parts[++i])
        }
        continue
      } else if (/[A-Za-z]/.test(part)) {
        // This assertion means the path was not a valid sequence of
        // [operation, X coordinate, Y coordinate, ...].
        //
        // It could indicate missing whitespace between the coordinates and the
        // operation.
        assert(isX, "translatePath: invalid argument")
      } else {
        part = +part
        part += isX ? dx : dy
        isX = !isX
      }
      out.push(part)
    }
    return out.join(" ")
  }

  /* shapes */

  static rect(w, h, props) {
    return SVG.el("rect", { ...props, x: 0, y: 0, width: w, height: h })
  }

  static ellipse(w, h, props) {
    return SVG.el("ellipse", {
      ...props,
      cx: w / 2,
      cy: h / 2,
      rx: w / 2,
      ry: h / 2,
    })
  }

  static arc(p1x, p1y, p2x, p2y, rx, ry) {
    return `L ${p1x} ${p1y} A ${rx} ${ry} 0 0 1 ${p2x} ${p2y}`
  }

  static arcw(p1x, p1y, p2x, p2y, rx, ry) {
    return `L ${p1x} ${p1y} A ${rx} ${ry} 0 0 0 ${p2x} ${p2y}`
  }

  static roundedPath(w, h) {
    const r = h / 2
    return [
      "M",
      r,
      0,
      SVG.arc(w - r, 0, w - r, h, r, r),
      SVG.arc(r, h, r, 0, r, r),
      "Z",
    ]
  }

  static roundedRect(w, h, props) {
    return SVG.path({ ...props, path: SVG.roundedPath(w, h) })
  }

  static pointedPath(w, h) {
    const r = h / 2
    return [
      "M",
      r,
      0,
      "L",
      w - r,
      0,
      w,
      r,
      "L",
      w,
      r,
      w - r,
      h,
      "L",
      r,
      h,
      0,
      r,
      "L",
      0,
      r,
      r,
      0,
      "Z",
    ]
  }

  static pointedRect(w, h, props) {
    return SVG.path({ ...props, path: SVG.pointedPath(w, h) })
  }

  static getTop(w) {
    return `M 0 3
      L 3 0
      L 13 0
      L 16 3
      L 24 3
      L 27 0
      L ${w - 3} 0
      L ${w} 3`
  }

  static getRingTop(w) {
    return `M 0 3
      L 3 0
      L 7 0
      L 10 3
      L 16 3
      L 19 0
      L ${w - 3} 0
      L ${w} 3`
  }

  static getRightAndBottom(w, y, hasNotch, inset) {
    if (typeof inset === "undefined") {
      inset = 0
    }
    let arr = ["L", w, y - 3, "L", w - 3, y]
    if (hasNotch) {
      arr = arr.concat([
        "L",
        inset + 27,
        y,
        "L",
        inset + 24,
        y + 3,
        "L",
        inset + 16,
        y + 3,
        "L",
        inset + 13,
        y,
      ])
    }
    if (inset > 0) {
      arr = arr.concat(["L", inset + 2, y, "L", inset, y + 2])
    } else {
      arr = arr.concat(["L", inset + 3, y, "L", 0, y - 3])
    }
    return arr.join(" ")
  }

  static getArm(w, armTop) {
    return `L 15 ${armTop - 2}
      L 17 ${armTop}
      L ${w - 3} ${armTop}
      L ${w} ${armTop + 3}`
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

  static hatRect(w, h, props) {
    return SVG.path({
      ...props,
      path: [
        "M",
        0,
        12,
        SVG.arc(0, 12, 80, 10, 80, 80),
        "L",
        w - 3,
        10,
        "L",
        w,
        10 + 3,
        SVG.getRightAndBottom(w, h, true),
        "Z",
      ],
    })
  }

  static curve(p1x, p1y, p2x, p2y, roundness) {
    roundness = roundness || 0.42
    const midX = (p1x + p2x) / 2.0
    const midY = (p1y + p2y) / 2.0
    const cx = Math.round(midX + roundness * (p2y - p1y))
    const cy = Math.round(midY - roundness * (p2x - p1x))
    return `${cx} ${cy} ${p2x} ${p2y}`
  }

  static procHatBase(w, h, archRoundness, props) {
    // TODO use arc()
    archRoundness = Math.min(0.2, 35 / w)
    return SVG.path({
      ...props,
      path: [
        "M",
        0,
        15,
        "Q",
        SVG.curve(0, 15, w, 15, archRoundness),
        SVG.getRightAndBottom(w, h, true),
        "M",
        -1,
        13,
        "Q",
        SVG.curve(-1, 13, w + 1, 13, archRoundness),
        "Q",
        SVG.curve(w + 1, 13, w, 16, 0.6),
        "Q",
        SVG.curve(w, 16, 0, 16, -archRoundness),
        "Q",
        SVG.curve(0, 16, -1, 13, 0.6),
        "Z",
      ],
    })
  }

  static procHatCap(w, h, archRoundness) {
    // TODO use arc()
    // TODO this doesn't look quite right
    return SVG.path({
      path: [
        "M",
        -1,
        13,
        "Q",
        SVG.curve(-1, 13, w + 1, 13, archRoundness),
        "Q",
        SVG.curve(w + 1, 13, w, 16, 0.6),
        "Q",
        SVG.curve(w, 16, 0, 16, -archRoundness),
        "Q",
        SVG.curve(0, 16, -1, 13, 0.6),
        "Z",
      ],
      class: "sb-define-hat-cap",
    })
  }

  static procHatRect(w, h, props) {
    const q = 52
    const y = h - q

    const archRoundness = Math.min(0.2, 35 / w)

    return SVG.move(
      0,
      y,
      SVG.group([
        SVG.procHatBase(w, q, archRoundness, props),
        SVG.procHatCap(w, q, archRoundness),
      ]),
    )
  }

  static mouthRect(w, h, isFinal, lines, props) {
    let y = lines[0].height
    const p = [SVG.getTop(w), SVG.getRightAndBottom(w, y, true, 15)]
    for (let i = 1; i < lines.length; i += 2) {
      const isLast = i + 2 === lines.length

      y += lines[i].height - 3
      p.push(SVG.getArm(w, y))

      const hasNotch = !(isLast && isFinal)
      const inset = isLast ? 0 : 15
      y += lines[i + 1].height + 3
      p.push(SVG.getRightAndBottom(w, y, hasNotch, inset))
    }
    return SVG.path({ ...props, path: p })
  }

  static ringRect(w, h, cy, cw, ch, shape, props) {
    const r = 8
    const func =
      shape === "reporter"
        ? SVG.roundedPath
        : shape === "boolean"
          ? SVG.pointedPath
          : SVG.capPath
    return SVG.path({
      ...props,
      path: [
        "M",
        r,
        0,
        SVG.arcw(r, 0, 0, r, r, r),
        SVG.arcw(0, h - r, r, h, r, r),
        SVG.arcw(w - r, h, w, h - r, r, r),
        SVG.arcw(w, r, w - r, 0, r, r),
        "Z",
        SVG.translatePath(4, cy || 4, func(cw, ch).join(" ")),
      ],
      "fill-rule": "even-odd",
    })
  }

  static commentRect(w, h, props) {
    const r = 6
    return SVG.path({
      ...props,
      class: "sb-comment",
      path: [
        "M",
        r,
        0,
        SVG.arc(w - r, 0, w, r, r, r),
        SVG.arc(w, h - r, w - r, h, r, r),
        SVG.arc(r, h, 0, h - r, r, r),
        SVG.arc(0, r, r, 0, r, r),
        "Z",
      ],
    })
  }

  static commentLine(width, props) {
    return SVG.move(
      -width,
      9,
      SVG.rect(width, 2, { ...props, class: "sb-comment-line" }),
    )
  }

  static strikethroughLine(w, props) {
    return SVG.path({
      ...props,
      path: ["M", 0, 0, "L", w, 0],
      class: "sb-diff sb-diff-del",
    })
  }
}
