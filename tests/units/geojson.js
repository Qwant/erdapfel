import { poiToGeoJSON, poisToGeoJSON } from '../../src/libs/geojson';
import IdunnPOI from '../../src/adapters/poi/idunn_poi';
const mockPoi1 = require('../__data__/poi.json');
const mockPoi2 = require('../__data__/poi2.json');

describe('geojson', () => {
  describe('poiToGeoJSON', () => {
    test('Converts an Idunn POI to a GeoJSON Feature with a Point geometry', () => {
      const poi = new IdunnPOI(mockPoi1);
      const geojson = poiToGeoJSON(poi);
      expect(geojson).toMatchObject({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [ poi.latLon.lng, poi.latLon.lat ],
        },
      });
    });

    test('Keeps or transform some POI properties as Feature properties', () => {
      const poi = new IdunnPOI(mockPoi1);
      const geojson = poiToGeoJSON(poi);
      expect(geojson.properties).toMatchObject({
        id: poi.id,
        name: poi.name,
        subclass: poi.subClassName,
      });
    });
  });

  describe('poisToGeoJSON', () => {
    test('Converts an array of Idunn POIs to a GeoJSON FeatureCollection of Point features', () => {
      const pois = [new IdunnPOI(mockPoi1), new IdunnPOI(mockPoi2)];
      const geojson = poisToGeoJSON(pois);
      expect(geojson.type).toEqual('FeatureCollection');
      expect(geojson.features.length).toEqual(2);
      expect(geojson.features[0]).toMatchObject({ type: 'Feature', geometry: { type: 'Point' } });
      expect(geojson.features[1]).toMatchObject({ type: 'Feature', geometry: { type: 'Point' } });
    });

    test('Returns a valid, empty FeatureCollection when given no POI', () => {
      const geojson = poisToGeoJSON([]);
      expect(geojson.type).toEqual('FeatureCollection');
      expect(geojson.features.length).toEqual(0);
    });
  });
});
