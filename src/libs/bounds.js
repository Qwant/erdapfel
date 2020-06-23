export const boundsFromFlatArray = coords =>
  [[coords[0], coords[1]], [coords[2], coords[3]]];

export const parseBboxString = bboxString =>
  boundsFromFlatArray(bboxString.split(',').map(coord => Number(coord)));

export const boundsToString = llBounds =>
  llBounds.toArray()
    .reduce((flatArray, current) => flatArray.concat(current), []) // flatten
    .map(coord => coord.toFixed(7))
    .join(',');
