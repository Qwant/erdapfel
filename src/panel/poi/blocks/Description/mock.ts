import type { PoiDescriptionBlockProps } from './index';

export const poiDescriptionBlockMock: PoiDescriptionBlockProps = {
  block: {
    type: 'description',
    description:
      'Le musée international de la Parfumerie est un musée, labellisé « Musée de France »,  situé à Grasse, dans les Alpes-Maritimes.',
    source: 'wikipedia',
    url: 'https://fr.wikipedia.org/wiki/Musée_international_de_la_Parfumerie',
  },
  texts: {
    wikipedia: 'Voir plus sur Wikipedia',
    pagesjaunes: 'Voir plus sur Jaunes',
    readMore: 'Voir plus',
  },
  // eslint-disable-next-line no-console
  onClick: () => console.log('On click see more'),
};
