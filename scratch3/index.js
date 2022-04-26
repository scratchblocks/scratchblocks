import SVG from "./draw.js"
import { LabelView } from "./blocks.js"
import style from "./style.js"

export function init(window) {
  SVG.init(window)

  LabelView.measuring = (function () {
    var canvas = SVG.makeCanvas()
    return canvas.getContext("2d")
  })()
}

export const makeStyle = styles.makeStyle
export { newView } from "./blocks.js"
