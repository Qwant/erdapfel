import React, { useCallback } from 'react';
import CategoryService from 'src/adapters/category_service';
import MainActionButton from 'src/components/ui/MainActionButton';
import Telemetry from 'src/libs/telemetry';
import { getLightBackground } from 'src/libs/colors';
import { saveQuery, getHistoryEnabled } from '../adapters/search_history';

const CategoryList = ({ className, limit = Number.MAX_VALUE }) => {
  const searchHistoryEnabled = getHistoryEnabled();
  const handleCategoryClick = useCallback(
    category => {
      if (searchHistoryEnabled && category) {
        saveQuery({ ...category, category });
      }
      Telemetry.add(Telemetry.HOME_CATEGORY, { category: category.name });
      window.app.navigateTo(`/places/?type=${category.name}`);
    },
    [searchHistoryEnabled]
  );

  return (
    <div className={className}>
      {CategoryService.getCategories()
        .slice(0, limit)
        .map(category => (
          <MainActionButton
            key={category.name}
            onClick={() => handleCategoryClick(category)}
            variant="category"
            label={category.shortLabel}
            icon={category.iconName}
            iconStyle={{
              color: category.color,
              backgroundColor: getLightBackground(category.color),
            }}
            ecoResponsible={category.ecoResponsible}
          />
        ))}
    </div>
  );
};

export default CategoryList;
