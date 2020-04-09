
export default class Intention {
  constructor({ filter, description }) {
    this.name = filter.category;
    this.category = filter.category;
    this.bbox = filter.bbox;
    this.place = description.place;
  }

  toQueryString = () => {
    const params = {};
    if (this.category) {
      params.type = this.category;
    }
    if (this.bbox) {
      params.bbox = this.bbox.join(',');
    }
    return new URLSearchParams(params).toString();
  }
}
