import { LngLatBounds } from 'mapbox-gl';

export const boundsFromFlatArray = (coords?: number[]): [[number, number], [number, number]] => {
  if (coords?.length !== 4 || coords?.some(coord => typeof coord !== 'number' || isNaN(coord))) {
    throw new Error(`Malformed bounds array: ${JSON.stringify(coords)}`);
  }
  return [
    [coords[0], coords[1]],
    [coords[2], coords[3]],
  ];
};

export const parseBboxString = (bboxStr: string) => {
  const portions = bboxStr?.split(',');
  const numberedPortions = portions?.map(i => parseFloat(i));
  return boundsFromFlatArray(numberedPortions);
};

export const boundsToString = (llBounds: LngLatBounds) =>
  llBounds
    .toArray()
    .reduce((flatArray, current) => flatArray.concat(current), []) // flatten
    .map(coord => coord.toFixed(7))
    .join(',');
