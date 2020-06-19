
export const boundsFromFlatArray = coords => [[coords[0], coords[1]], [coords[2], coords[3]]];

export const parseBboxString = bboxString =>
  boundsFromFlatArray(bboxString.split(',').map(coord => Number(coord)));

export const boundsToString = llBounds =>
  llBounds.toArray()
    .flat()
    .map(coord => coord.toFixed(7))
    .join(',');
