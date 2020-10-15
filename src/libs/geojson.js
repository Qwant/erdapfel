import IconManager from 'src/adapters/icon_manager';

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

export const poiToGeoJSON = poi => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [ poi.latLon.lng, poi.latLon.lat ],
  },
  properties: {
    id: poi.id,
    name: poi.name,
    subclass: poi.subClassName,
    iconName: IconManager.get(poi).iconClass,
  },
});

export const poisToGeoJSON = pois => ({
  type: 'FeatureCollection',
  features: pois.map(poiToGeoJSON),
});

export const emptyFeatureCollection = poisToGeoJSON([]);
