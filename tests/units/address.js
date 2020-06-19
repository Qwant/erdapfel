import {
  format,
  normalize,
} from '../../src/libs/address';

describe('Address utils', () => {
  test('format', () => {
    const cases = [
      {
        address: { street: 'street', city: 'city', country: 'country' },
        expected: 'street, city, country',
      },
      {
        address: { country: 'city' },
        expected: 'city',
      },
      {
        address: { country: 'country' },
        expected: 'country',
      },
    ];

    cases.forEach(({ address, expected }) => {
      expect(format(address)).toEqual(expected);
    });
  });

  test('normalize', () => {
    const casesIdunn = [
      {
        poi: {
          name: 'Museum',
          address: {
            admins: [{
              class_name: 'city',
              name: 'city',
            }, {
              class_name: 'country',
              name: 'country',
            }],
          },
        }, expected: {
          street: undefined,
          city: 'city',
          country: 'country',
          label: undefined,
        },
      },
      {
        poi: {
          address: {
            admin: null,
            admins: [],
            country_code: 'FR',
            housenumber: '19',
            id: null,
            label: '19 rue Delbet, 75014 Paris',
            name: '19 rue Delbet',
            postcode: '75014',
            street: {
              id: null,
              label: 'rue Delbet (Paris)',
              name: 'rue Delbet',
              postcodes: ['75014'],
            },
            // "blocks": (5) [{…}, {…}, {…}, {…}, {…}]
          },
          class_name: 'restaurant',
          // "geometry": {type: "Point", coordinates: Array(2), center: Array(2)}
          id: 'pj:57103351',
          local_name: "L'As du Poulet",
          meta: { source: 'pages_jaunes' },
          name: "L'As du Poulet",
          subclass_name: 'restaurant',
          type: 'poi',
        },
        expected: {
          street: '19 rue Delbet',
          city: undefined,
          country: undefined,
          label: '19 rue Delbet, 75014 Paris',
        },
      },
    ];

    const casesBragi = [
      {
        poi: {
          name: 'Museum',
          geocoding: {
            administrative_regions: [{
              zone_type: 'city',
              name: 'city',
            }, {
              zone_type: 'country',
              name: 'country',
            }],
          },
        },
        expected: {
          street: undefined,
          city: 'city',
          country: 'country',
          label: undefined,
        },
      },
      {
        poi: {
          geocoding: {
            address: {
              id: 'addr:2.230565;48.641182:10',
              type: 'house',
              label: '10 Impasse Jean-Jacques Rousseau (Marcoussis)',
              name: '10 Impasse Jean-Jacques Rousseau', housenumber: '10',
            },
            administrative_regions: [
              {
                bbox: 4 [1.9144582, 48.2845851, 2.5853029, 48.7761285],
                // codes: (4) [{…}, {…}, {…}, {…}],
                coord: { lon: 2.4289666999999997, lat: 48.6241665 },
                id: 'admin:osm:relation:7401',
                insee: '91',
                label: 'Essonne, Île-de-France, France',
                level: 6,
                name: 'Essonne',
                parent_id: 'admin:osm:relation:8649',
                zip_codes: [],
                zone_type: 'state_district' },
              {
                bbox: 4 [1.4462445, 48.1201456, 3.5592208, 49.241431],
                // codes: (4) [{…}, {…}, {…}, {…}],
                coord: { lon: 2.3514616, lat: 48.8566969 },
                id: 'admin:osm:relation:8649',
                insee: '11',
                label: 'Île-de-France, France',
                level: 4,
                name: 'Île-de-France',
                parent_id: 'admin:osm:relation:2202162',
                zip_codes: [],
                zone_type: 'state' },
              {
                bbox: 4 [-5.4517733, 41.261115499999995, 9.8282225, 51.3055721],
                // codes: (5) [{…}, {…}, {…}, {…}, {…}],
                coord: { lon: 2.3514616, lat: 48.8566969 },
                id: 'admin:osm:relation:2202162',
                insee: '',
                label: 'France',
                level: 2,
                name: 'France',
                parent_id: null,
                zip_codes: [],
                zone_type: 'country' },
              {
                bbox: 4 [2.1622162, 48.6283879, 2.2533546, 48.6697281],
                // codes: (2) [{…}, {…}],
                coord: { lon: 2.2310497, lat: 48.6432483 },
                id: 'admin:osm:relation:34076',
                insee: '91363',
                label: 'Marcoussis (91460), Essonne, Île-de-France, France',
                level: 8,
                name: 'Marcoussis',
                parent_id: 'admin:osm:relation:7401',
                zip_codes: ['91460'],
                zone_type: 'city',
              },
            ],
            city: 'Marcoussis',
            citycode: '91363',
            id: 'osm:node:58721152',
            label: 'Restaurant Municipal (Marcoussis)',
            name: 'Restaurant Municipal',
            // poi_types: [{…}],
            postcode: '91460',
            // properties: (6) [{…}, {…}, {…}, {…}, {…}, {…}],
            type: 'poi',
          },
        },
        expected: {
          street: '10 Impasse Jean-Jacques Rousseau',
          city: 'Marcoussis',
          country: 'France',
          label: '10 Impasse Jean-Jacques Rousseau (Marcoussis)',
        },
      },
    ];

    casesIdunn.forEach(({ poi, expected }) => {
      expect(normalize('idunn', poi)).toMatchObject(expected);
    });

    casesBragi.forEach(({ poi, expected }) => {
      expect(normalize('bragi', poi)).toMatchObject(expected);
    });
  });
});
