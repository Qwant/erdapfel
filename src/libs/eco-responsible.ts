import CategoryService from 'src/adapters/category_service';

export const isEcoResponsibleCategory = (categoryName: string) => {
  return CategoryService.getCategories().find(c => c.name === categoryName).ecoResponsible ?? false;
};

export const getEcoResponsibleCategoryFromURL = () => {
  return new URLSearchParams(window.location.href.split('#')[0]).get('eco');
};
