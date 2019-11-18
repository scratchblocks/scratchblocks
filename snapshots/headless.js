#!/usr/bin/env node

const fs = require('fs');
const util = require('util');
const fs_writeFile = util.promisify(fs.writeFile);

const browserify = require('browserify');

function bundleScratchblocks() {
  return new Promise((resolve, reject) => {
    const client = browserify({
      entries: ['snapshots/client.js'],
      cache: {},
      packageCache: {},
      detectGlobals: false,
    });

    const stream = client.bundle();
    stream.on('error', err => {
      reject(new Error(err));
    });

    const chunks = [];
    stream.on('data', data => {
      chunks.push(data);
    });
    stream.on('end', () => {
      return resolve(Buffer.concat(chunks));
    });
  });
}

const puppeteer = require('puppeteer');

const parseDataUrl = url => {
  const match = url.match(/^data:image\/png;base64,(.+)$/);
  if (!match) {
    throw new Error('Could not parse data URL: ' + JSON.stringify(url));
  }
  return Buffer.from(match[1], 'base64');
};

class Renderer {
  constructor() {
    this.scale = 2;
  }

  async start() {
    const scriptContents = await bundleScratchblocks();

    const html = `<!doctype html>
    <meta charset=utf-8>
    <script>${scriptContents}</script>
    `;

    this.browser = await puppeteer.launch({
      //headless: false,
      //slowMo: 250,
    });
    this.page = await this.browser.newPage();

    await this.page.setContent(html);
  }

  async snapshot(script, options) {
    const args = [script, options, this.scale].map(x => JSON.stringify(x)).join(', ');
    const dataURL = await this.page.evaluate('render(' + args + ')');
    const buffer = parseDataUrl(dataURL);
    return buffer;
  }

  async snapshotToFile(script, options, path) {
    const buffer = await this.snapshot(script, options, this.scale);
    await fs_writeFile(path, buffer);
  }

  async stop() {
    await this.browser.close();
  }
}

const globalRenderer = new Renderer();

module.exports = globalRenderer;
