var SVG = require("./draw.js")

var Style = (module.exports = {
  cssContent: `
    .sb3-label {
      font: 500 12pt Helevetica Neue, Helvetica, sans-serif;
      fill: #fff;
      word-spacing: +1pt;
    }

    .sb3-motion { fill: #4c97ff; stroke: #3373cc; }
    .sb3-motion-alt { fill: #4280d7; }
    .sb3-motion-dark { fill: #4c97ff; }
    .sb3-looks { fill: #9966ff; stroke: #774dcb; }
    .sb3-looks-alt { fill: #855cd6; }
    .sb3-looks-dark { fill: #bd42bd; }
    .sb3-sound { fill: #cf63cf; stroke: #bd42bd; }
    .sb3-sound-alt { fill: #c94fc9; }
    .sb3-sound-dark { fill: #bd42bd; }
    .sb3-control { fill: #ffab19; stroke: #cf8b17; }
    .sb3-control-alt { fill: #ec9c13; }
    .sb3-control-dark { fill: #cf8b17; }
    .sb3-events { fill: #ffbf00; stroke: #cc9900; }
    .sb3-events-alt { fill: #e6ac00; }
    .sb3-events-dark { fill: #cc9900; }
    .sb3-sensing { fill: #5cb1d6; stroke: #2e8eb8; }
    .sb3-sensing-alt { fill: #47a8d1; }
    .sb3-sensing-dark { fill: #2e8eb8; }
    .sb3-pen { fill: #0fbd8c; stroke: #0b8e69; }
    .sb3-pen-alt { fill: #0da57a; }
    .sb3-pen-dark { fill: #0b8e69; }
    .sb3-operators { fill: #59c059; stroke: #389438; }
    .sb3-operators-alt { fill: #46b946; }
    .sb3-operators-dark { fill: #389438; }
    .sb3-variables { fill: #ff8c1a; stroke: #db6e00; }
    .sb3-variables-alt { fill: #ff8000; }
    .sb3-variables-dark { fill: #db6e00; }
    .sb3-list { fill: #ff661a; stroke: #e64d00; }
    .sb3-list-alt { fill: #ff5500; }
    .sb3-list-dark { fill: #e64d00; }
    .sb3-custom { fill: #ff6680; stroke: #ff3355; }
    .sb3-custom-alt { fill: #ff4d6a; }
    .sb3-custom-dark { fill: #ff3355; }
    .sb3-custom-arg { fill: #ff6680; stroke: #ff3355; }

    .sb3-obsolete { fill: #d42828; }
    .sb3-extension { fill: #4b4a60; }
    .sb3-grey { fill: #969696; }

    .sb3-input-number,
    .sb3-input-string {
      fill: #fff;
    }
    .sb3-literal-number,
    .sb3-literal-string,
    .sb3-literal-number-dropdown,
    .sb3-literal-dropdown {
      word-spacing: 0;
    }
    .sb3-literal-number,
    .sb3-literal-string {
      fill: #575e75;
    }

    .sb3-outline {
      stroke: #fff;
      stroke-opacity: 0.2;
      stroke-width: 2;
      fill: none;
    }

    .sb3-comment {
      fill: #ffffa5;
      stroke: #d0d1d2;
      stroke-width: 1;
    }
    .sb3-comment-line {
      fill: #ffff80;
    }
    .sb3-comment-label {
      font: 400 12pt Helevetica Neue, Helvetica, sans-serif;
      fill: #000;
      word-spacing: 0;
    }

    .sb3-diff {
      fill: none;
      stroke: #000;
    }
    .sb3-diff-ins {
      stroke-width: 2px;
    }
    .sb3-diff-del {
      stroke-width: 3px;
    }
  `.replace(/[ \n]+/, " "),

  makeIcons() {
    return [
      SVG.setProps(
        SVG.group([
          SVG.el("path", {
            d:
              "M20.8 3.7c-.4-.2-.9-.1-1.2.2-2 1.6-4.8 1.6-6.8 0-2.3-1.9-5.6-2.3-8.3-1v-.4c0-.6-.5-1-1-1s-1 .4-1 1v18.8c0 .5.5 1 1 1h.1c.5 0 1-.5 1-1v-6.4c1-.7 2.1-1.2 3.4-1.3 1.2 0 2.4.4 3.4 1.2 2.9 2.3 7 2.3 9.8 0 .3-.2.4-.5.4-.9V4.7c0-.5-.3-.9-.8-1zm-.3 10.2C18 16 14.4 16 11.9 14c-1.1-.9-2.5-1.4-4-1.4-1.2.1-2.3.5-3.4 1.1V4c2.5-1.4 5.5-1.1 7.7.6 2.4 1.9 5.7 1.9 8.1 0h.2l.1.1-.1 9.2z",
            fill: "#45993d",
          }),
          SVG.el("path", {
            d:
              "M20.6 4.8l-.1 9.1v.1c-2.5 2-6.1 2-8.6 0-1.1-.9-2.5-1.4-4-1.4-1.2.1-2.3.5-3.4 1.1V4c2.5-1.4 5.5-1.1 7.7.6 2.4 1.9 5.7 1.9 8.1 0h.2c0 .1.1.1.1.2z",
            fill: "#4cbf56",
          }),
        ]),
        {
          id: "greenFlag",
          transform: "scale(0.75)", // TODO
        }
      ),
      SVG.setProps(
        SVG.group([
          SVG.el("path", {
            d:
              "M12.71 2.44A2.41 2.41 0 0 1 12 4.16L8.08 8.08a2.45 2.45 0 0 1-3.45 0L.72 4.16A2.42 2.42 0 0 1 0 2.44 2.48 2.48 0 0 1 .71.71C1 .47 1.43 0 6.36 0s5.39.46 5.64.71a2.44 2.44 0 0 1 .71 1.73z",
            fill: "#231f20",
            opacity: ".1",
          }),
          SVG.el("path", {
            d:
              "M6.36 7.79a1.43 1.43 0 0 1-1-.42L1.42 3.45a1.44 1.44 0 0 1 0-2c.56-.56 9.31-.56 9.87 0a1.44 1.44 0 0 1 0 2L7.37 7.37a1.43 1.43 0 0 1-1.01.42z",
            fill: "#fff",
          }),
        ]),
        {
          id: "dropdownArrow",
          transform: 'scale(0.944)',
        }
      ),
      SVG.el("path", {
        d:
          "M6.724 0C3.01 0 0 2.91 0 6.5c0 2.316 1.253 4.35 3.14 5.5H5.17v-1.256C3.364 10.126 2.07 8.46 2.07 6.5 2.07 4.015 4.152 2 6.723 2c1.14 0 2.184.396 2.993 1.053L8.31 4.13c-.45.344-.398.826.11 1.08L15 8.5 13.858.992c-.083-.547-.514-.714-.963-.37l-1.532 1.172A6.825 6.825 0 0 0 6.723 0z",
        fill: "#fff",
        id: "turnRight",
      }),
      SVG.el("path", {
        d:
          "M3.637 1.794A6.825 6.825 0 0 1 8.277 0C11.99 0 15 2.91 15 6.5c0 2.316-1.253 4.35-3.14 5.5H9.83v-1.256c1.808-.618 3.103-2.285 3.103-4.244 0-2.485-2.083-4.5-4.654-4.5-1.14 0-2.184.396-2.993 1.053L6.69 4.13c.45.344.398.826-.11 1.08L0 8.5 1.142.992c.083-.547.514-.714.963-.37l1.532 1.172z",
        fill: "#fff",
        id: "turnLeft",
      }),
      SVG.el("path", {
        d: "M0 0L4 4L0 8Z",
        fill: "#111",
        id: "addInput",
      }),
      SVG.el("path", {
        d: "M4 0L4 8L0 4Z",
        fill: "#111",
        id: "delInput",
      }),
      SVG.setProps(
        SVG.group([
          SVG.el("path", {
            d: "M8 0l2 -2l0 -3l3 0l-4 -5l-4 5l3 0l0 3l-8 0l0 2",
            fill: "#000",
            opacity: "0.3",
          }),
          SVG.move(
            -1,
            -1,
            SVG.el("path", {
              d: "M8 0l2 -2l0 -3l3 0l-4 -5l-4 5l3 0l0 3l-8 0l0 2",
              fill: "#fff",
              opacity: "0.9",
            })
          ),
        ]),
        {
          id: "loopArrow",
        }
      ),
    ]
  },

  makeStyle() {
    var style = SVG.el("style")
    style.appendChild(SVG.cdata(Style.cssContent))
    return style
  },

  defaultFont: "500 12pt Helevetica Neue, Helvetica, sans-serif",
  commentFont: "400 12pt Helevetica Neue, Helvetica, sans-serif",
})
