import Category from './category';
import nconf from '@qwant/nconf-getter';
import categories from 'config/categories.yml';
import ExtendedString from '../libs/string';

export default class CategoryService {

  static getCategories() {
    if (!nconf.get().category.enabled) {
      return [];
    }

    if (!window.__categoriesCache) {
      window.__categoriesCache = categories.map(categ => Category.create(categ));
    }

    return window.__categoriesCache;
  }

  static getCategoryByName(name) {
    return CategoryService.getCategories().find(categ => categ.name === name) || null;
  }

  static getMatchingCategories(term) {
    const matchedCategories = [];

    const loadedCategories = CategoryService.getCategories();
    const cleanedTerm = ExtendedString.normalize(term);

    for (const category of loadedCategories) {
      if (category.isMatching(cleanedTerm)) {
        matchedCategories.push(category);
      }
    }

    return matchedCategories;
  }
}
