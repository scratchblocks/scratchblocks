const SVG = require('./draw.js');
const Filter = require('./filter.js');

const Style = (module.exports = {
  cssContent: `
    .sb-label {
      font-family: Lucida Grande, Verdana, Arial, DejaVu Sans, sans-serif;
      font-weight: bold;
      fill: #fff;
      font-size: 10px;
      word-spacing: +1px;
    }

    .sb-obsolete { fill: #d42828; }
    .sb-motion { fill: #4a6cd4; }
    .sb-looks { fill: #8a55d7; }
    .sb-sound { fill: #bb42c3; }
    .sb-pen { fill: #0e9a6c;  }
    .sb-events { fill: #c88330; }
    .sb-control { fill: #e1a91a; }
    .sb-sensing { fill: #2ca5e2; }
    .sb-operators { fill: #5cb712; }
    .sb-variables { fill: #ee7d16; }
    .sb-list { fill: #cc5b22 }
    .sb-custom { fill: #632d99; }
    .sb-custom-arg { fill: #5947b1; }
    .sb-extension { fill: #4b4a60; }
    .sb-grey { fill: #969696; }

    .sb-bevel {
      filter: url(#bevelFilter);
    }

    .sb-input {
      filter: url(#inputBevelFilter);
    }
    .sb-input-number,
    .sb-input-string,
    .sb-input-number-dropdown {
      fill: #fff;
    }
    .sb-literal-number,
    .sb-literal-string,
    .sb-literal-number-dropdown,
    .sb-literal-dropdown {
      font-weight: normal;
      font-size: 9px;
      word-spacing: 0;
    }
    .sb-literal-number,
    .sb-literal-string,
    .sb-literal-number-dropdown {
      fill: #000;
    }

    .sb-darker {
      filter: url(#inputDarkFilter);
    }

    .sb-outline {
      stroke: #fff;
      stroke-opacity: 0.2;
      stroke-width: 2;
      fill: none;
    }

    .sb-define-hat-cap {
      stroke: #632d99;
      stroke-width: 1;
      fill: #8e2ec2;
    }

    .sb-comment {
      fill: #ffffa5;
      stroke: #d0d1d2;
      stroke-width: 1;
    }
    .sb-comment-line {
      fill: #ffff80;
    }
    .sb-comment-label {
      font-family: Helevetica, Arial, DejaVu Sans, sans-serif;
      font-weight: bold;
      fill: #5c5d5f;
      word-spacing: 0;
      font-size: 12px;
    }

    .sb-diff {
      fill: none;
      stroke: #000;
    }
    .sb-diff-ins {
      stroke-width: 2px;
    }
    .sb-diff-del {
      stroke-width: 3px;
    }
  `.replace(/[ \n]+/, ' '),

  makeIcons() {
    return [
      SVG.el('path', {
        d:
          'M1.504 21L0 19.493 4.567 0h1.948l-.5 2.418s1.002-.502 3.006 0c2.006.503 3.008 2.01 6.517 2.01 3.508 0 4.463-.545 4.463-.545l-.823 9.892s-2.137 1.005-5.144.696c-3.007-.307-3.007-2.007-6.014-2.51-3.008-.502-4.512.503-4.512.503L1.504 21z',
        fill: '#3f8d15',
        id: 'greenFlag',
      }),
      SVG.el('path', {
        d:
          'M6.724 0C3.01 0 0 2.91 0 6.5c0 2.316 1.253 4.35 3.14 5.5H5.17v-1.256C3.364 10.126 2.07 8.46 2.07 6.5 2.07 4.015 4.152 2 6.723 2c1.14 0 2.184.396 2.993 1.053L8.31 4.13c-.45.344-.398.826.11 1.08L15 8.5 13.858.992c-.083-.547-.514-.714-.963-.37l-1.532 1.172A6.825 6.825 0 0 0 6.723 0z',
        fill: '#fff',
        id: 'turnRight',
      }),
      SVG.el('path', {
        d:
          'M3.637 1.794A6.825 6.825 0 0 1 8.277 0C11.99 0 15 2.91 15 6.5c0 2.316-1.253 4.35-3.14 5.5H9.83v-1.256c1.808-.618 3.103-2.285 3.103-4.244 0-2.485-2.083-4.5-4.654-4.5-1.14 0-2.184.396-2.993 1.053L6.69 4.13c.45.344.398.826-.11 1.08L0 8.5 1.142.992c.083-.547.514-.714.963-.37l1.532 1.172z',
        fill: '#fff',
        id: 'turnLeft',
      }),
      SVG.el('path', {
        d: 'M0 0L4 4L0 8Z',
        fill: '#111',
        id: 'addInput',
      }),
      SVG.el('path', {
        d: 'M4 0L4 8L0 4Z',
        fill: '#111',
        id: 'delInput',
      }),
      SVG.setProps(
        SVG.group([
          SVG.el('path', {
            d: 'M8 0l2 -2l0 -3l3 0l-4 -5l-4 5l3 0l0 3l-8 0l0 2',
            fill: '#000',
            opacity: '0.3',
          }),
          SVG.move(
            -1,
            -1,
            SVG.el('path', {
              d: 'M8 0l2 -2l0 -3l3 0l-4 -5l-4 5l3 0l0 3l-8 0l0 2',
              fill: '#fff',
              opacity: '0.9',
            })
          ),
        ]),
        {
          id: 'loopArrow',
        }
      ),
    ];
  },

  makeStyle() {
    const style = SVG.el('style');
    style.appendChild(SVG.cdata(Style.cssContent));
    return style;
  },

  bevelFilter(id, inset) {
    const f = new Filter(id);

    const alpha = 'SourceAlpha';
    const s = inset ? -1 : 1;
    const blur = f.blur(1, alpha);

    f.merge([
      'SourceGraphic',
      f.comp('in', f.flood('#fff', 0.15), f.subtract(alpha, f.offset(+s, +s, blur))),
      f.comp('in', f.flood('#000', 0.7), f.subtract(alpha, f.offset(-s, -s, blur))),
    ]);

    return f.el;
  },

  darkFilter(id) {
    const f = new Filter(id);

    f.merge(['SourceGraphic', f.comp('in', f.flood('#000', 0.2), 'SourceAlpha')]);

    return f.el;
  },

  darkRect(w, h, category, el) {
    return SVG.setProps(
      SVG.group([
        SVG.setProps(el, {
          class: ['sb-' + category, 'sb-darker'].join(' '),
        }),
      ]),
      { width: w, height: h }
    );
  },

  defaultFontFamily: 'Lucida Grande, Verdana, Arial, DejaVu Sans, sans-serif',
});
