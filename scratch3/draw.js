/* for constucting SVGs */

function extend(src, dest) {
  return Object.assign({}, src, dest);
}

// set by SVG.init
let document;
let xml;

const directProps = {
  textContent: true,
};

const SVG = (module.exports = {
  init(window) {
    document = window.document;
    const DOMParser = window.DOMParser;
    xml = new DOMParser().parseFromString('<xml></xml>', 'application/xml');
    SVG.XMLSerializer = window.XMLSerializer;
  },

  makeCanvas() {
    return document.createElement('canvas');
  },

  cdata(content) {
    return xml.createCDATASection(content);
  },

  el(name, props) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', name);
    return SVG.setProps(el, props);
  },

  setProps(el, props) {
    for (const key in props) {
      const value = '' + props[key];
      if (directProps[key]) {
        el[key] = value;
      } else if (/^xlink:/.test(key)) {
        el.setAttributeNS('http://www.w3.org/1999/xlink', key.slice(6), value);
      } else if (props[key] !== null && Object.prototype.hasOwnProperty.call(props, key)) {
        el.setAttributeNS(null, key, value);
      }
    }
    return el;
  },

  withChildren(el, children) {
    for (let i = 0; i < children.length; i++) {
      el.appendChild(children[i]);
    }
    return el;
  },

  group(children) {
    return SVG.withChildren(SVG.el('g'), children);
  },

  newSVG(width, height) {
    return SVG.el('svg', {
      version: '1.1',
      width: width,
      height: height,
    });
  },

  polygon(props) {
    return SVG.el(
      'polygon',
      extend(props, {
        points: props.points.join(' '),
      })
    );
  },

  path(props) {
    return SVG.el(
      'path',
      extend(props, {
        path: null,
        d: props.path.join(' '),
      })
    );
  },

  text(x, y, content, props) {
    return SVG.el(
      'text',
      extend(props, {
        x: x,
        y: y,
        textContent: content,
      })
    );
  },

  symbol(href) {
    return SVG.el('use', {
      'xlink:href': href,
    });
  },

  move(dx, dy, el) {
    SVG.setProps(el, {
      transform: ['translate(', dx, ' ', dy, ')'].join(''),
    });
    return el;
  },

  /* shapes */

  rect(w, h, props) {
    return SVG.el(
      'rect',
      extend(props, {
        x: 0,
        y: 0,
        width: w,
        height: h,
      })
    );
  },

  roundRect(w, h, props) {
    return SVG.rect(
      w,
      h,
      extend(props, {
        rx: 4,
        ry: 4,
      })
    );
  },

  pillRect(w, h, props) {
    const r = h / 2;
    return SVG.rect(
      w,
      h,
      extend(props, {
        rx: r,
        ry: r,
      })
    );
  },

  pointedPath(w, h) {
    const r = h / 2;
    return [
      ['M', r, 0].join(' '),
      ['L', w - r, 0, w, r].join(' '),
      ['L', w, r, w - r, h].join(' '),
      ['L', r, h, 0, r].join(' '),
      ['L', 0, r, r, 0].join(' '),
      'Z',
    ];
  },

  pointedRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: SVG.pointedPath(w, h),
      })
    );
  },

  topNotch(w, y) {
    return [
      'c 2 0 3 1 4 2',
      'l 4 4',
      'c 1 1 2 2 4 2',
      'h 12',
      'c 2 0 3 -1 4 -2',
      'l 4 -4',
      'c 1 -1 2 -2 4 -2',
      ['L', w - 4, y].join(' '),
      'a 4 4 0 0 1 4 4',
    ].join(' ');
  },

  getTop(w) {
    return ['M 0 4', 'A 4 4 0 0 1 4 0', 'H 12', SVG.topNotch(w, 0)].join(' ');
  },

  getRingTop(w) {
    return ['M', 0, 3, 'L', 3, 0, 'L', 7, 0, 'L', 10, 3, 'L', 16, 3, 'L', 19, 0, 'L', w - 3, 0, 'L', w, 3].join(' ');
  },

  getRightAndBottom(w, y, hasNotch, inset) {
    if (typeof inset === 'undefined') {
      inset = 0;
    }

    let arr = [['L', w, y - 4].join(' '), ['a', 4, 4, 0, 0, 1, -4, 4].join(' ')];

    if (hasNotch) {
      arr = arr.concat([
        ['L', inset + 48, y].join(' '),
        'c -2 0 -3 1 -4 2',
        'l -4 4',
        'c -1 1 -2 2 -4 2',
        'h -12',
        'c -2 0 -3 -1 -4 -2',
        'l -4 -4',
        'c -1 -1 -2 -2 -4 -2',
      ]);
    }
    if (inset === 0) {
      arr.push('L', inset + 4, y);
      arr.push('a 4 4 0 0 1 -4 -4');
    } else {
      arr.push('L', inset + 4, y);
      arr.push('a 4 4 0 0 0 -4 4');
    }
    return arr.join(' ');
  },

  getArm(w, armTop) {
    return [
      ['L', 16, armTop - 4].join(' '),
      'a 4 4 0 0 0 4 4',
      ['L', 28, armTop].join(' '),
      SVG.topNotch(w, armTop),
    ].join(' ');
  },

  getArmNoNotch(w, armTop) {
    return [
      ['L', 16, armTop - 4].join(' '),
      'a 4 4 0 0 0 4 4',
      ['L', 28, armTop].join(' '),
      ['L', w - 4, armTop].join(' '),
      'a 4 4 0 0 1 4 4',
    ].join(' ');
  },

  stackRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: [SVG.getTop(w), SVG.getRightAndBottom(w, h, true, 0), 'Z'],
      })
    );
  },

  capPath(w, h) {
    return [SVG.getTop(w), SVG.getRightAndBottom(w, h, false, 0), 'Z'];
  },

  ringCapPath(w, h) {
    return [SVG.getRingTop(w), SVG.getRightAndBottom(w, h, false, 0), 'Z'];
  },

  capRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: SVG.capPath(w, h),
      })
    );
  },

  getHatTop(w) {
    return ['M 0 16', 'c 25,-22 71,-22 96,0', ['L', w - 4, 16].join(' '), 'a 4 4 0 0 1 4 4'].join(' ');
  },

  hatRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: [SVG.getHatTop(w), SVG.getRightAndBottom(w, h, true, 0), 'Z'],
      })
    );
  },

  getProcHatTop(w) {
    return ['M 0 20', 'a 20 20 0 0 1 20 -20', ['L', w - 20, 0].join(' '), 'a 20,20 0 0,1 20,20'].join(' ');
  },

  procHatRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: [SVG.getProcHatTop(w), SVG.getRightAndBottom(w, h, true, 0), 'Z'],
      })
    );
  },

  mouthRect(w, h, isFinal, lines, props) {
    let y = lines[0].height;
    const p = [SVG.getTop(w), SVG.getRightAndBottom(w, y, true, 16)];
    for (let i = 1; i < lines.length; i += 2) {
      const isLast = i + 2 === lines.length;

      const line = lines[i];
      y += line.height - 3;

      if (line.isFinal) {
        p.push(SVG.getArmNoNotch(w, y));
      } else {
        p.push(SVG.getArm(w, y));
      }

      const hasNotch = !(isLast && isFinal);
      const inset = isLast ? 0 : 16;
      y += lines[i + 1].height + 3;
      p.push(SVG.getRightAndBottom(w, y, hasNotch, inset));
    }
    p.push('Z');
    return SVG.path(
      extend(props, {
        path: p,
      })
    );
  },

  commentRect(w, h, props) {
    return SVG.roundRect(
      w,
      h,
      extend(props, {
        class: 'sb3-comment',
      })
    );
  },

  commentLine(width, props) {
    return SVG.move(
      -width,
      9,
      SVG.rect(
        width,
        2,
        extend(props, {
          class: 'sb3-comment-line',
        })
      )
    );
  },

  strikethroughLine(w, props) {
    return SVG.path(
      extend(props, {
        path: ['M', 0, 0, 'L', w, 0],
        class: 'sb3-diff sb3-diff-del',
      })
    );
  },
});
