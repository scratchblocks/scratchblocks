import SVG from "./draw"
import { LabelView } from "./blocks"
import style from "./style"

export function init(window) {
  SVG.init(window)

  LabelView.measuring = (function () {
    var canvas = SVG.makeCanvas()
    return canvas.getContext("2d")
  })()
}

export const makeStyle = styles.makeStyle
export { newView } from "./blocks"
