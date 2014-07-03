
var Geometry = module.exports = {};

Geometry.POINT   = 'Point';
Geometry.LINE    = 'LineString';
Geometry.POLYGON = 'Polygon';

var proto = Geometry;

proto.getCentroid = function(featureParts) {
  var coordinates;

  if (!featureParts || !featureParts.length) {
    return;
  }

  if (featureParts.length > 1) {
    coordinates = getLargestGeometry(featureParts); //coords+type
  } else {
    coordinates = featureParts[0];
  }

  if (!coordinates) {
    return;
  }

  var
    startX = coordinates[0], startY = coordinates[1],
    xTmp = 0, yTmp = 0,
    dx0, dy0,
    dx1, dy1,
    len, lenSum = 0;

  for (var i = 0, il = coordinates.length-3; i < il; i+=2) {
    dx0 = coordinates[i  ]-startX;
    dy0 = coordinates[i+1]-startY;
    dx1 = coordinates[i+2]-startX;
    dy1 = coordinates[i+3]-startY;

    len = dx0*dy1 - dx1*dy0;

    lenSum += len;
    xTmp += (dx1+dx0) * len;
    yTmp += (dy1+dy0) * len;
  }

  if (lenSum) {
    return {
      x: (xTmp/(3*lenSum)) + startX <<0,
      y: (yTmp/(3*lenSum)) + startY <<0
    };
  }

  return {
    x: startX,
    y: startY
  };
};

function getBBox(coordinates) {
  var
    min = Math.min,
    max = Math.max,
    minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  for (var i = 0, il = coordinates.length-1; i < il; i+=2) {
    minX = min(minX, coordinates[i]);
    maxX = max(maxX, coordinates[i]);
    minY = min(minY, coordinates[i+1]);
    maxY = max(maxY, coordinates[i+1]);
  }

  return { minX:minX, minY:minY, maxX:maxX, maxY:maxY };
}

function getArea(coordinates) {
  var
    bbox = getBBox(coordinates),
    dx = bbox.maxX-bbox.minX,
    dy = bbox.maxY-bbox.minY;
  return dx*dy;
}

function getLargestGeometry(featureParts) {
  var
    area, maxArea = -Infinity,
    feature,
    coordinates, maxCoordinates;

  for (var i = 0, il = featureParts.length; i < il; i++) {
    feature = featureParts[i];
    coordinates = feature.coordinates;

    if (feature.type === Geometry.POLYGON) {
      coordinates = coordinates[0];
    }

    area = getArea(coordinates);

    if (area > maxArea) {
      maxArea = area;
      maxCoordinates = coordinates;
    }
  }

  return maxCoordinates;
}
