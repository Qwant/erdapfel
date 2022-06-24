import { PoiWebsiteBlockProps } from '.';

export const poiWebsiteBlockMock: PoiWebsiteBlockProps = {
  texts: {
    website: 'Site web',
  },
  block: {
    type: 'website',
    url: 'http://jmmotors.fr',
    label: 'jmmotors.fr',
  },
  // eslint-disable-next-line no-console
  onClickWebsite: () => console.log('Click on website block'),
};
