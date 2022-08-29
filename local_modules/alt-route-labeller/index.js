import { coordAll } from '@turf/meta';
import { lineString } from '@turf/helpers';
import { getCoord } from '@turf/invariant';
import along from '@turf/along';
import lineLength from '@turf/length';
import bearing from '@turf/bearing';

const TOLERANCE = 0.000001;
const floatEquals = (f1, f2) => Math.abs(f1 - f2) < TOLERANCE;
const coordEquals = (c1 = [], c2 = []) => floatEquals(c1[0], c2[0]) && floatEquals(c1[1], c2[1]);
const asKey = coord => `${coord[0].toFixed(6)},${coord[1].toFixed(6)}`;
const last = (array = []) => array[array.length - 1];

// find the point at the given distance ratio on the linestring
const project = ratio => ls => {
  const length = lineLength(ls);
  const lngLat = getCoord(along(ls, length * ratio));
  // keep the local bearing of the line to later choose an anchor minimizing the portion of line covered.
  const localLineBearing = bearing(
    along(ls, length * (ratio - 0.1)),
    along(ls, length * (ratio + 0.1))
  );

  return { lngLat, localLineBearing };
};

function distinctSegment(coordinates, coordCounts) {
  const adjacentCoordsUsedOnce = [[]];
  coordinates.forEach(coord => {
    if (coordCounts.get(asKey(coord)) > 1) {
      adjacentCoordsUsedOnce.push([]);
    } else {
      last(adjacentCoordsUsedOnce).push(coord);
    }
  });
  const longestDistinctSegment = adjacentCoordsUsedOnce
    .filter(a => a.length > 0)
    .reduce((longest, current) => (current.length > longest.length ? current : longest), []);

  const tmp = longestDistinctSegment.length === 0 ? coordinates : longestDistinctSegment;

  if (tmp.length === 1) tmp[1] = tmp[0];

  return lineString(tmp);
}

// extract the longest segment of each linestring
// whose coordinates don't overlap with another feature
export function findDistinctSegments(linestrings) {
  if (linestrings.length < 2) {
    return linestrings;
  }
  // extract raw coordinates
  const featuresCoords = linestrings.map(coordAll);
  // count occurences of each coordinate accross all features
  const coordCounts = new Map();
  [].concat(...featuresCoords).forEach(coord => {
    coordCounts.set(asKey(coord), (coordCounts.get(asKey(coord)) || 0) + 1);
  });
  return featuresCoords.map(coordinates => distinctSegment(coordinates, coordCounts));
}

function toSimpleLinestring(feature) {
  const allCoordsWithNoDups = coordAll(feature).reduce((noDups, coord) => {
    const prevCoord = last(noDups);
    if (!prevCoord || !coordEquals(prevCoord, coord)) {
      noDups.push(coord);
    }
    return noDups;
  }, []);
  return lineString(allCoordsWithNoDups);
}

// Reduce possibilities of collision by chosing anchors so that labels repulse each other
function optimizeAnchors(positions) {
  return positions.map((position, index) => {
    const others = positions.slice();
    others.splice(index, 1);
    const othersBearing = getBearingFromOtherPoints(position, others);
    return {
      lngLat: position.lngLat,
      anchor: getAnchor(position, othersBearing),
    };
  });
}

function getBearingFromOtherPoints(position, others) {
  return (
    others
      .map(other => bearing(other.lngLat, position.lngLat))
      .reduce((avg, value, _index, { length }) => avg + value / length, 0) || // mean
    0
  );
}

function getAnchor(position, otherBearing) {
  const axis =
    Math.abs(position.localLineBearing) < 45 || Math.abs(position.localLineBearing) > 135
      ? 'vertical'
      : 'horizontal';

  if (axis === 'vertical') {
    return otherBearing > 0 ? 'left' : 'right';
  }
  return Math.abs(otherBearing) < 90 ? 'bottom' : 'top';
}

// routes can be a FeatureCollection or an array of Feature or Geometry
export function getLabelPositions(routes = []) {
  const featuresOrGeoms = Array.isArray(routes) ? routes : routes.features;
  const lineStrings = featuresOrGeoms.map(toSimpleLinestring);
  const segments = findDistinctSegments(lineStrings);
  const positions = segments.map(project(0.5));
  return optimizeAnchors(positions);
}
