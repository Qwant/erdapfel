import CategoryService from 'src/adapters/category_service';

export const isEcoResponsibleCategory = (categoryName: string) => {
  return CategoryService.getCategories().find(c => c.name === categoryName).ecoResponsible ?? false;
};
