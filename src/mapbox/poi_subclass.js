import { getPlaceCategoryName } from '@qwant/qwant-maps-common';

export default function(subclass) {
  const lang = window.getLang().code;
  return getPlaceCategoryName({ subclass }, lang);
}
