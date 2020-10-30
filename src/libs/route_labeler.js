import { coordAll } from '@turf/meta';
import { lineString } from '@turf/helpers';
import { getCoord, getCoords } from '@turf/invariant';
import along from '@turf/along';
import lineLength from '@turf/length';
import lineSliceAlong from '@turf/line-slice-along';
import bearing from '@turf/bearing';

// find the point at the given distance ratio on the linestring
function project(ratio, ls) {
  const length = lineLength(ls);
  const lngLat = getCoord(along(ls, length * ratio));
  // compute the local "axis" of the line (horizontal or vertical)
  // around the label position to optimize its direction
  const axis = getAxis(lineSliceAlong(ls, length * (ratio - 0.01), length * (ratio + 0.01)));
  const anchor = axis === 'horizontal' ? 'bottom' : 'left';
  // @TODO: optimize label anchor wrt. each other, to reduce risk of collisions

  return { lngLat, anchor };
}

function getAxis(ls) {
  const segmentCoords = getCoords(ls);
  const segmentBearing = bearing(segmentCoords[0], segmentCoords[segmentCoords.length - 1]);
  if (Math.abs(segmentBearing) < 45 || Math.abs(segmentBearing) > 135) {
    return 'vertical';
  }
  return 'horizontal';
}

const asKey = coord => `${coord[0]},${coord[1]}`;

function distinctSegment(coordinates, coordCounts) {
  let start = 0;
  let end = coordinates.length - 1;

  // a distinct segment is a part of a line where coordinates
  // appear only once accross all the features
  for (let index = 0; index < coordinates.length; index++) {
    const coord = coordinates[index];
    if (start === 0 && coordCounts.get(asKey(coord)) === 1) {
      start = index;
    }
    if (start !== 0 && end === coordinates.length - 1 && coordCounts.get(asKey(coord)) !== 1) {
      end = index;
      break;
    }
  }

  return lineString(coordinates.slice(start, end));
}

// extract the first segment of each linestring
// whose coordinates don't overlap with another feature
export function findDistinctSegments(linestrings) {
  if (linestrings.length < 2) {
    return linestrings;
  }
  // extract raw coordinates
  const featuresCoords = linestrings.map(ls => dropRepeatedCoords(coordAll(ls)));
  // count occurences of each coordinate accross all features
  const coordCounts = new Map();
  [].concat(...featuresCoords).forEach(coord => {
    coordCounts.set(asKey(coord), (coordCounts.get(asKey(coord)) || 0) + 1);
  });
  return featuresCoords.map(coordinates => distinctSegment(coordinates, coordCounts));
}

const toSimpleLinestring = geoJson => lineString(coordAll(geoJson));

const coordEquals = (c1 = [], c2 = []) => c1[0] === c2[0] && c1[1] === c2[1];

function dropRepeatedCoords(list) {
  const result = [];
  for (let i = 0; i < list.length; i++) {
    if (!coordEquals(result[result.length - 1], list[i])) {
      result.push(list[i]);
    }
  }
  return result;
}

export function getLabelPositions(features) {
  const lineStrings = features.map(toSimpleLinestring);
  const distinctSegments = findDistinctSegments(lineStrings);
  return distinctSegments.map(branchCoords => project(0.5, branchCoords));
}
