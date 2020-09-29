import React from 'react';
import CategoryService from 'src/adapters/category_service';
import MainActionButton from 'src/components/ui/MainActionButton';
import Telemetry from 'src/libs/telemetry';
import { getLightBackground } from 'src/libs/colors';

const handleCategoryClick = category => {
  Telemetry.add(Telemetry.HOME_CATEGORY, { category: category.name });
  window.app.navigateTo(`/places/?type=${category.name}`);
};

const CategoryList = ({ className, limit = Number.MAX_VALUE }) =>
  <div className={className}>
    {CategoryService.getCategories()
      .filter(c => c.iconName) // ignore categories used on detected intention only
      .slice(0, limit)
      .map(category => <MainActionButton
        key={category.name}
        onClick={() => handleCategoryClick(category)}
        variant="category"
        label={category.label}
        icon={category.iconName}
        iconStyle={{
          color: category.color,
          backgroundColor: getLightBackground(category.color),
        }}
      />)
    }
  </div>;

export default CategoryList;
