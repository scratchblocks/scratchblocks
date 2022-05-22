import SVG from "./draw.js"
import { LabelView } from "./blocks.js"
import style from "./style.js"

export function init(window) {
  SVG.init(window)

  LabelView.measuring = (function () {
    const canvas = SVG.makeCanvas()
    return canvas.getContext("2d")
  })()
}

export const makeStyle = style.makeStyle
export { newView } from "./blocks.js"
