import CategoryService from 'src/adapters/category_service';
import { buildQueryString } from 'src/libs/url_utils';

export default class Intention {
  constructor({ filter, description }) {
    this.category = CategoryService.getCategoryByName(filter.category);
    this.bbox = filter.bbox;
    this.place = description.place;
  }

  toQueryString = () => buildQueryString({
    type: this.category?.name,
    bbox: this.bbox?.join(','),
  });
}
