export const boundsFromFlatArray = (coords = []) => {
  if (coords.length < 4 || coords.some(coord => typeof coord !== 'number')) {
    throw new Error(`Malformed bounds array: ${JSON.stringify(coords)}`);
  }
  return [
    [coords[0], coords[1]],
    [coords[2], coords[3]],
  ];
};

export const parseBboxString = bboxString =>
  boundsFromFlatArray(bboxString.split(',').map(coord => Number(coord)));

export const boundsToString = llBounds =>
  llBounds
    .toArray()
    .reduce((flatArray, current) => flatArray.concat(current), []) // flatten
    .map(coord => coord.toFixed(7))
    .join(',');
