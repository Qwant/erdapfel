import type { PoiPhoneBlockProps } from './index';

const COMMONS = {
  texts: {
    show_the_number: 'Voir le numéro',
    phone: 'Téléphone',
  },
  block: {
    type: 'phone' as const,
    url: 'tel:+33111111111',
    international_format: '+33111111111',
    local_format: '01 11 11 11 11',
  },
};

export const poiPhoneBlockMockHidden: PoiPhoneBlockProps = {
  ...COMMONS,
  isDefaultHidden: true,
};

export const poiPhoneBlockMockVisible: PoiPhoneBlockProps = {
  ...COMMONS,
  isDefaultHidden: false,
};
