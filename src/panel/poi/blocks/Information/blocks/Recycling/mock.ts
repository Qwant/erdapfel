import { PoiRecyclingBlockProps } from './';

export const poiRecyclingBlockMock: PoiRecyclingBlockProps = {
  texts: {
    glass: 'Verre',
    recyclable: 'Recyclable',
    unknown: 'Inconnu',
    updated_at: 'Dernière mise à jour: {datetime}',
  },
  locale: 'fr_FR',
  block: {
    containers: [
      {
        filling_level: 50,
        type: 'glass',
        place_description: 'Place descrition',
        updated_at: '2022-01-01',
      },
      {
        filling_level: 80,
        type: 'recyclable',
        place_description: 'Autres recyclable',
        updated_at: '2022-02-01',
      },
    ],
  },
};
