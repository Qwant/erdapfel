import React from 'react';
import CategoryService from 'src/adapters/category_service';
import MainActionButton from 'src/components/ui/MainActionButton';

const CategoryList = ({ className }) =>
  <div className={className}>
    {CategoryService.getCategories().map(category =>
      <MainActionButton
        key={category.name}
        onClick={() => { window.app.navigateTo(`/places/?type=${category.name}`); }}
        variant="category"
        label={category.label}
        icon={category.iconName}
        iconStyle={{ backgroundColor: category.backgroundColor }}
      />)
    }
  </div>;

export default CategoryList;
