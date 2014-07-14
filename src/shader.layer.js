
var Shader = require('./shader');
var Events = require('./core/events');

// properties needed for each geometry type to be renderered
var requiredProperties = {};
requiredProperties[Shader.POINT] = [
  'marker-width',
  'line-color'
];
requiredProperties[Shader.LINE] = [
  'line-color'
];
requiredProperties[Shader.POLYGON] = [
  'polygon-fill',
  'line-color'
];
requiredProperties[Shader.TEXT] = [
  'text-name',
  'text-fill'
];

// last context style applied, this is a shared variable
// for all the shaders
// could be shared across shader layersm but not urgently
var currentContextStyle = {};

var propertyMapping = {
  'marker-width': 'marker-width',
  'marker-fill': 'fillStyle',
  'marker-line-color': 'strokeStyle',
  'marker-line-width': 'lineWidth',
  'marker-color': 'fillStyle',
  'point-color': 'fillStyle',

  'line-color': 'strokeStyle',
  'line-width': 'lineWidth',
  'line-opacity': 'globalAlpha',

  'polygon-fill': 'fillStyle',
  'polygon-opacity': 'globalAlpha',

  'text-face-name': 'font',
  'text-size': 'font',
  'text-fill': 'fillStyle',
  'text-opacity': 'globalAlpha',
  'text-halo-fill': 'strokeStyle',
  'text-halo-radius': 'lineWidth',
  'text-align': 'textAlign',
  'text-name': 'text-name'
};

var ShaderLayer = module.exports = function(shader, shadingOrder) {
  Events.prototype.constructor.call(this);
  this._compiled = {};
  this._shadingOrder = shadingOrder || [
    Shader.POINT,
    Shader.POLYGON,
    Shader.LINE,
    Shader.TEXT
  ];
  this.compile(shader);
};

var proto = ShaderLayer.prototype = new Events();

proto.clone = function() {
  return new ShaderLayer(this._shaderSrc, this._shadingOrder);
};

proto.compile = function(shader) {
  this._shaderSrc = shader;
  if (typeof shader === 'string') {
    shader = function() {
      return shader;
    };
  }
  var property;
  for (var attr in shader) {
    if (property = propertyMapping[attr]) {
      this._compiled[property] = shader[attr];
    }
  }
  this.emit('change');
};

// given feature properties and map rendering content returns
// the style to apply to canvas context
// TODO: optimize this to not evaluate when featureProperties do not
// contain values involved in the shader
proto.evalStyle = function(featureProperties, mapContext) {
  mapContext = mapContext || {};
  var
    style = {},
    shader = this._compiled,
    // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#5-for-in
    props = Object.keys(shader),
    prop, val;

  for (var i = 0, len = props.length; i < len; ++i) {
    prop = props[i];
    val = shader[prop];
    if (typeof val === 'function') {
      val = val(featureProperties, mapContext);
    }
    style[prop] = val;
  }
  return style;
},

// TODO: skip text related styles
proto.apply = function(context, style) {
  var
    currentStyle,
    changed = false,
    props = Object.keys(style),
    prop, val;

  for (var i = 0, len = props.length; i < len; ++i) {
    prop = props[i];
    // careful, setter context.fillStyle = '#f00' but getter context.fillStyle === '#ff0000' also upper case, lower case...
    //
    // color parse (and probably other props) depends on canvas implementation so direct
    // comparasions with context contents can't be done.
    // use an extra object to store current state
    // * chrome 35.0.1916.153:
    // ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    // ctx.strokeStyle -> "rgba(0, 0, 0, 0.09803921568627451)"
    // * ff 29.0.1
    // ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    // ctx.strokeStyle -> "rgba(0, 0, 0, 0.1)"
    val = style[prop];

    var id = context._shId;
    if (!id) {
      id = context._shId = Object.keys(currentContextStyle).length + 1;
      currentContextStyle[id] = {};
    }
    currentStyle = currentContextStyle[id];
    if (currentStyle[prop] !== val) {
      context[prop] = currentStyle[prop] = val;
      changed = true;
    }
  }
  return changed;
};

// TODO: only do text related styles
proto.textApply = function(context, style) {
  return this.apply(context, style);
};

proto.getShadingOrder = function() {
  return this._shadingOrder;
};

// return true if the feature need to be rendered
proto.needsRender = function(shadingType, style) {
  var props = requiredProperties[shadingType], p;

  for (var i = 0; i < props.length; ++i) {
    p = props[i];
    if (this._shaderSrc[p] && style[ propertyMapping[p] ]) {
      return true;
    }
  }

  return false;
};

var RGB2Int = function(r, g, b) {
  return r | (g<<8) | (b<<16);
};

var Int2RGB = function(input) {
  var r = input & 0xff;
  var g = (input >> 8) & 0xff;
  var b = (input >> 16) & 0xff;
  return [r, g, b];
};


/**
 * return a shader clone ready for hit test.
 * @keyAttribute: string with the attribute used as key (usually the feature id)
 */
proto.hitShader = function(keyAttribute) {
  var hit = this.clone();
  // replace all fillStyle and strokeStyle props to use a custom
  // color
  for(var k in hit._compiled) {
    if (k === 'fillStyle' || k === 'strokeStyle') {
      //var p = hit._compiled[k];
      hit._compiled[k] = function(featureProperties, mapContext) {
        return 'rgb(' + Int2RGB(featureProperties[keyAttribute] + 1).join(',') + ')';
      };
    }
  }
  return hit;
};

// TODO: could be static methods of VECNIK.Shader
ShaderLayer.RGB2Int = RGB2Int;
ShaderLayer.Int2RGB = Int2RGB;
