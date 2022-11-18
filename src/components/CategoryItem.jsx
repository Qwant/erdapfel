import React, { useCallback } from 'react';
import MainActionButton from 'src/components/ui/MainActionButton';
import Telemetry from 'src/libs/telemetry';
import { getLightBackground } from 'src/libs/colors';
import { saveQuery, getHistoryEnabled } from '../adapters/search_history';

const CategoryItem = ({ category, text, subtext }) => {
  const searchHistoryEnabled = getHistoryEnabled();
  const handleCategoryClick = useCallback(() => {
    if (searchHistoryEnabled && category) {
      saveQuery({ ...category, category });
    }
    Telemetry.add(Telemetry.HOME_CATEGORY, { category: category.name });
    window.app.navigateTo(`/places/?type=${category.name}`);
  }, [searchHistoryEnabled, category]);

  return (
    <button className="poi_panel__category_item u-mb-s" onClick={() => handleCategoryClick()}>
      <MainActionButton
        className="mainActionButton--no-interaction"
        key={category.name}
        variant="category"
        icon={category.iconName}
        iconStyle={{
          color: category.color,
          backgroundColor: getLightBackground(category.color),
          pointerEvents: 'none',
        }}
        ecoResponsible={category.ecoResponsible}
      />
      {(text || subtext) && (
        <div className="label_block">
          {text && <h4>{text}</h4>}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </button>
  );
};

export default CategoryItem;
