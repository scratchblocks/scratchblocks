/* for constucting SVGs */

function extend(src, dest) {
  return Object.assign({}, src, dest);
}
function assert(bool, message) {
  if (!bool) throw 'Assertion failed! ' + (message || '');
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
    const text = SVG.el(
      'text',
      extend(props, {
        x: x,
        y: y,
        textContent: content,
      })
    );
    return text;
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

  translatePath(dx, dy, path) {
    let isX = true;
    const parts = path.split(' ');
    const out = [];
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      if (part === 'A') {
        const j = i + 5;
        out.push('A');
        while (i < j) {
          out.push(parts[++i]);
        }
        continue;
      } else if (/[A-Za-z]/.test(part)) {
        assert(isX);
      } else {
        part = +part;
        part += isX ? dx : dy;
        isX = !isX;
      }
      out.push(part);
    }
    return out.join(' ');
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

  ellipse(w, h, props) {
    return SVG.el(
      'ellipse',
      extend(props, {
        cx: w / 2,
        cy: h / 2,
        rx: w / 2,
        ry: h / 2,
      })
    );
  },

  arc(p1x, p1y, p2x, p2y, rx, ry) {
    return ['L', p1x, p1y, 'A', rx, ry, 0, 0, 1, p2x, p2y].join(' ');
  },

  arcw(p1x, p1y, p2x, p2y, rx, ry) {
    return ['L', p1x, p1y, 'A', rx, ry, 0, 0, 0, p2x, p2y].join(' ');
  },

  roundedPath(w, h) {
    const r = h / 2;
    return ['M', r, 0, SVG.arc(w - r, 0, w - r, h, r, r), SVG.arc(r, h, r, 0, r, r), 'Z'];
  },

  roundedRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: SVG.roundedPath(w, h),
      })
    );
  },

  pointedPath(w, h) {
    const r = h / 2;
    return ['M', r, 0, 'L', w - r, 0, w, r, 'L', w, r, w - r, h, 'L', r, h, 0, r, 'L', 0, r, r, 0, 'Z'];
  },

  pointedRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: SVG.pointedPath(w, h),
      })
    );
  },

  getTop(w) {
    return ['M', 0, 3, 'L', 3, 0, 'L', 13, 0, 'L', 16, 3, 'L', 24, 3, 'L', 27, 0, 'L', w - 3, 0, 'L', w, 3].join(' ');
  },

  getRingTop(w) {
    return ['M', 0, 3, 'L', 3, 0, 'L', 7, 0, 'L', 10, 3, 'L', 16, 3, 'L', 19, 0, 'L', w - 3, 0, 'L', w, 3].join(' ');
  },

  getRightAndBottom(w, y, hasNotch, inset) {
    if (typeof inset === 'undefined') {
      inset = 0;
    }
    let arr = ['L', w, y - 3, 'L', w - 3, y];
    if (hasNotch) {
      arr = arr.concat(['L', inset + 27, y, 'L', inset + 24, y + 3, 'L', inset + 16, y + 3, 'L', inset + 13, y]);
    }
    if (inset > 0) {
      arr = arr.concat(['L', inset + 2, y, 'L', inset, y + 2]);
    } else {
      arr = arr.concat(['L', inset + 3, y, 'L', 0, y - 3]);
    }
    return arr.join(' ');
  },

  getArm(w, armTop) {
    return ['L', 15, armTop - 2, 'L', 15 + 2, armTop, 'L', w - 3, armTop, 'L', w, armTop + 3].join(' ');
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

  hatRect(w, h, props) {
    return SVG.path(
      extend(props, {
        path: [
          'M',
          0,
          12,
          SVG.arc(0, 12, 80, 10, 80, 80),
          'L',
          w - 3,
          10,
          'L',
          w,
          10 + 3,
          SVG.getRightAndBottom(w, h, true),
          'Z',
        ],
      })
    );
  },

  curve(p1x, p1y, p2x, p2y, roundness) {
    roundness = roundness || 0.42;
    const midX = (p1x + p2x) / 2.0;
    const midY = (p1y + p2y) / 2.0;
    const cx = Math.round(midX + roundness * (p2y - p1y));
    const cy = Math.round(midY - roundness * (p2x - p1x));
    return [cx, cy, p2x, p2y].join(' ');
  },

  procHatBase(w, h, archRoundness, props) {
    // TODO use arc()
    archRoundness = Math.min(0.2, 35 / w);
    return SVG.path(
      extend(props, {
        path: [
          'M',
          0,
          15,
          'Q',
          SVG.curve(0, 15, w, 15, archRoundness),
          SVG.getRightAndBottom(w, h, true),
          'M',
          -1,
          13,
          'Q',
          SVG.curve(-1, 13, w + 1, 13, archRoundness),
          'Q',
          SVG.curve(w + 1, 13, w, 16, 0.6),
          'Q',
          SVG.curve(w, 16, 0, 16, -archRoundness),
          'Q',
          SVG.curve(0, 16, -1, 13, 0.6),
          'Z',
        ],
      })
    );
  },

  procHatCap(w, h, archRoundness) {
    // TODO use arc()
    // TODO this doesn't look quite right
    return SVG.path({
      path: [
        'M',
        -1,
        13,
        'Q',
        SVG.curve(-1, 13, w + 1, 13, archRoundness),
        'Q',
        SVG.curve(w + 1, 13, w, 16, 0.6),
        'Q',
        SVG.curve(w, 16, 0, 16, -archRoundness),
        'Q',
        SVG.curve(0, 16, -1, 13, 0.6),
        'Z',
      ],
      class: 'sb-define-hat-cap',
    });
  },

  procHatRect(w, h, props) {
    const q = 52;
    const y = h - q;

    const archRoundness = Math.min(0.2, 35 / w);

    return SVG.move(
      0,
      y,
      SVG.group([SVG.procHatBase(w, q, archRoundness, props), SVG.procHatCap(w, q, archRoundness)])
    );
  },

  mouthRect(w, h, isFinal, lines, props) {
    let y = lines[0].height;
    const p = [SVG.getTop(w), SVG.getRightAndBottom(w, y, true, 15)];
    for (let i = 1; i < lines.length; i += 2) {
      const isLast = i + 2 === lines.length;

      y += lines[i].height - 3;
      p.push(SVG.getArm(w, y));

      const hasNotch = !(isLast && isFinal);
      const inset = isLast ? 0 : 15;
      y += lines[i + 1].height + 3;
      p.push(SVG.getRightAndBottom(w, y, hasNotch, inset));
    }
    return SVG.path(
      extend(props, {
        path: p,
      })
    );
  },

  ringRect(w, h, cy, cw, ch, shape, props) {
    const r = 8;
    const func =
      shape === 'reporter'
        ? SVG.roundedPath
        : shape === 'boolean'
        ? SVG.pointedPath
        : cw < 40
        ? SVG.ringCapPath
        : SVG.capPath;
    return SVG.path(
      extend(props, {
        path: [
          'M',
          r,
          0,
          SVG.arcw(r, 0, 0, r, r, r),
          SVG.arcw(0, h - r, r, h, r, r),
          SVG.arcw(w - r, h, w, h - r, r, r),
          SVG.arcw(w, r, w - r, 0, r, r),
          'Z',
          SVG.translatePath(4, cy || 4, func(cw, ch).join(' ')),
        ],
        'fill-rule': 'even-odd',
      })
    );
  },

  commentRect(w, h, props) {
    const r = 6;
    return SVG.path(
      extend(props, {
        class: 'sb-comment',
        path: [
          'M',
          r,
          0,
          SVG.arc(w - r, 0, w, r, r, r),
          SVG.arc(w, h - r, w - r, h, r, r),
          SVG.arc(r, h, 0, h - r, r, r),
          SVG.arc(0, r, r, 0, r, r),
          'Z',
        ],
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
          class: 'sb-comment-line',
        })
      )
    );
  },

  strikethroughLine(w, props) {
    return SVG.path(
      extend(props, {
        path: ['M', 0, 0, 'L', w, 0],
        class: 'sb-diff sb-diff-del',
      })
    );
  },
});
