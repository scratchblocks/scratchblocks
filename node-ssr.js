import init from "./index.js"
import { parse } from "./syntax/index.js"

let nodeWindow

try {
  const { JSDOM } = await import("jsdom")
  const dom = new JSDOM()
  nodeWindow = dom.window
} catch {
  try {
    let createCanvas
    const { DOMParser, XMLSerializer, DOMImplementation } = await import(
      "@xmldom/xmldom"
    )
    const nodeDocument = new DOMImplementation().createDocument(
      "http://www.w3.org/2000/svg",
      null,
      null,
    )
    try {
      createCanvas = (await import("@napi-rs/canvas")).createCanvas
    } catch {
      try {
        createCanvas = (await import("canvas")).createCanvas
      } catch {
        // pass
      }
    }
    if (createCanvas) {
      const origCreateElement = nodeDocument.createElement.bind(nodeDocument)
      nodeDocument.createElement = tagName =>
        tagName === "canvas"
          ? createCanvas(300, 150)
          : origCreateElement(tagName)
    }
    nodeWindow = {
      document: nodeDocument,
      DOMParser,
      XMLSerializer,
    }
  } catch {
    // pass
  }
}

const sb = init(nodeWindow)

export const {
  allLanguages,
  loadLanguages,
  Label,
  Icon,
  Input,
  Block,
  Comment,
  Script,
  Document,
  newView,
  render,
} = sb

export { parse }

/**
 * Parse Scratch block code and render it directly to an SVG XML string.
 *
 * @param {string} code      - Scratch block source, e.g. "move (10) steps"
 * @param {object} [options] - Same options accepted by scratchblocks.render()
 *   - style:     "scratch3" | "scratch3-high-contrast" | "scratch2"  (default: "scratch3")
 *   - languages: string[]  (default: ["en"])
 *   - scale:     number    (default: 1)
 * @returns {string} Complete SVG XML string
 */
export function renderToSVGString(code, options = {}) {
  options = { style: "scratch3", ...options }
  const doc = parse(code, options)
  const view = sb.newView(doc, options)
  const svg = view.render()
  svg.setAttribute("class", `scratchblocks-style-${options.style}`)
  return view.exportSVGString()
}
