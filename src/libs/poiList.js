import CategoryService from 'src/adapters/category_service';

export function getListDescription(category, query) {
  return CategoryService.getCategoryByName(category)?.getInputValue() || query || null;
}
