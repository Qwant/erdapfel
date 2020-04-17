import CategoryService from 'src/adapters/category_service';

export default class Intention {
  constructor({ filter, description }) {
    this.category = CategoryService.getCategoryByName(filter.category);
    this.name = this.category ? this.category.getInputValue() : '';
    this.bbox = filter.bbox;
    this.place = description.place;
  }

  toQueryString = () => {
    const params = {};
    if (this.category) {
      params.type = this.category.name;
    }
    if (this.bbox) {
      params.bbox = this.bbox.join(',');
    }
    return new URLSearchParams(params).toString();
  }
}
