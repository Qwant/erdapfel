import CategoryService from 'src/adapters/category_service';
import { buildQueryString } from 'src/libs/url_utils';

export default class Intention {
  constructor({ filter, description }) {
    this.category = CategoryService.getCategoryByName(filter.category);
    this.fullTextQuery = filter.q;
    this.bbox = filter.bbox;
    this.place = description.place;
  }

  isValid = () => this.category || this.fullTextQuery;

  toQueryString = () => buildQueryString({
    q: this.fullTextQuery,
    type: this.category?.name,
    bbox: this.bbox?.join(','),
  });
}
