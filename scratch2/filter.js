function extend(src, dest) {
  return Object.assign({}, src, dest);
}

const SVG = require('./draw.js');

const Filter = function(id, props) {
  this.el = SVG.el(
    'filter',
    extend(props, {
      id: id,
      x0: '-50%',
      y0: '-50%',
      width: '200%',
      height: '200%',
    })
  );
  this.highestId = 0;
};
Filter.prototype.fe = function(name, props, children) {
  const shortName = name.toLowerCase().replace(/gaussian|osite/, '');
  const id = [shortName, '-', ++this.highestId].join('');
  this.el.appendChild(
    SVG.withChildren(
      SVG.el(
        'fe' + name,
        extend(props, {
          result: id,
        })
      ),
      children || []
    )
  );
  return id;
};
Filter.prototype.comp = function(op, in1, in2, props) {
  return this.fe(
    'Composite',
    extend(props, {
      operator: op,
      in: in1,
      in2: in2,
    })
  );
};
Filter.prototype.subtract = function(in1, in2) {
  return this.comp('arithmetic', in1, in2, { k2: +1, k3: -1 });
};
Filter.prototype.offset = function(dx, dy, in1) {
  return this.fe('Offset', {
    in: in1,
    dx: dx,
    dy: dy,
  });
};
Filter.prototype.flood = function(color, opacity, in1) {
  return this.fe('Flood', {
    in: in1,
    'flood-color': color,
    'flood-opacity': opacity,
  });
};
Filter.prototype.blur = function(dev, in1) {
  return this.fe('GaussianBlur', {
    in: in1,
    stdDeviation: [dev, dev].join(' '),
  });
};
Filter.prototype.merge = function(children) {
  this.fe(
    'Merge',
    {},
    children.map(function(name) {
      return SVG.el('feMergeNode', {
        in: name,
      });
    })
  );
};

module.exports = Filter;
