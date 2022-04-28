#!/usr/bin/env node

import fs from "fs"
import util from "util"
const fs_writeFile = util.promisify(fs.writeFile)

import puppeteer from "puppeteer"
import express from "express"

const parseDataUrl = url => {
  const match = url.match(/^data:image\/png;base64,(.+)$/)
  if (!match) {
    throw new Error("Could not parse data URL: " + JSON.stringify(url))
  }
  return Buffer.from(match[1], "base64")
}

class Renderer {
  constructor() {
    this.scale = 2
  }

  async start() {
    const app = express()
    app.use(express.static("."))
    await new Promise(resolve => {
      this.server = app.listen(8002, resolve)
    })
    this.browser = await puppeteer.launch({
      //headless: false,
      //slowMo: 250,
    })
    this.page = await this.browser.newPage()
    this.page.on("pageerror", e => {
      throw new Error("Page threw uncaught exception", { cause: e })
    })

    await this.page.goto(
      "http://localhost:8002/snapshots/snapshot-testing.html"
    )
    await this.page.waitForFunction("window.scratchblocksLoaded")
  }

  async snapshot(script, options) {
    const args = [script, options, this.scale]
      .map(x => JSON.stringify(x))
      .join(", ")
    const dataURL = await this.page.evaluate("render(" + args + ")")
    const buffer = parseDataUrl(dataURL)
    return buffer
  }

  async snapshotToFile(script, options, path) {
    const buffer = await this.snapshot(script, options, this.scale)
    await fs_writeFile(path, buffer)
  }

  async stop() {
    await this.browser.close()
    if (this.server) this.server.close()
  }
}

export default new Renderer()
