import SVG from "./draw.js"

export default class Filter {
  constructor(id, props) {
    this.el = SVG.el("filter", {
      ...props,
      id: id,
      x0: "-50%",
      y0: "-50%",
      width: "200%",
      height: "200%",
    })
    this.highestId = 0
  }

  fe(name, props, children) {
    const shortName = name.toLowerCase().replace(/gaussian|osite/, "")
    const id = `${shortName}-${++this.highestId}`
    this.el.appendChild(
      SVG.withChildren(
        SVG.el(`fe${name}`, { ...props, result: id }),
        children || [],
      ),
    )
    return id
  }

  comp(op, in1, in2, props) {
    return this.fe("Composite", { ...props, operator: op, in: in1, in2: in2 })
  }

  subtract(in1, in2) {
    return this.comp("arithmetic", in1, in2, { k2: +1, k3: -1 })
  }

  offset(dx, dy, in1) {
    return this.fe("Offset", {
      in: in1,
      dx: dx,
      dy: dy,
    })
  }

  flood(color, opacity, in1) {
    return this.fe("Flood", {
      in: in1,
      "flood-color": color,
      "flood-opacity": opacity,
    })
  }

  blur(dev, in1) {
    return this.fe("GaussianBlur", {
      in: in1,
      stdDeviation: `${dev} ${dev}`,
    })
  }

  colorMatrix(in1, values) {
    return this.fe("ColorMatrix", {
      in: in1,
      type: "matrix",
      values: values.join(" "),
    })
  }

  merge(children) {
    this.fe(
      "Merge",
      {},
      children.map(name =>
        SVG.el("feMergeNode", {
          in: name,
        }),
      ),
    )
  }
}
