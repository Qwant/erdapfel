
const geoJsonGeometryToFeature = geometry => ({
  type: 'Feature',
  geometry,
});

export const normalizeToFeatureCollection = geoJson => {
  if (geoJson.type === 'FeatureCollection') {
    return geoJson;
  }
  const feature = geoJson.type === 'Feature' ? geoJson : geoJsonGeometryToFeature(geoJson);
  return {
    type: 'FeatureCollection',
    features: [ feature ],
  };
};

export const setProperty = (geoJson, key, value) => ({
  ...geoJson,
  properties: {
    ...geoJson.properties,
    [key]: value,
  },
});
