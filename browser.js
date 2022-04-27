import init from "./index.js"

const scratchblocks = (window.scratchblocks = init(window))

// add our CSS to the page
scratchblocks.appendStyles()

export default scratchblocks
