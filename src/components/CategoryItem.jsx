import React, { useCallback } from 'react';
import MainActionButton from 'src/components/ui/MainActionButton';
import Telemetry from 'src/libs/telemetry';
import { getLightBackground } from 'src/libs/colors';
import { saveQuery, getHistoryEnabled } from '../adapters/search_history';
import { useI18n } from 'src/hooks';

const CategoryItem = ({ category }) => {
  const { _ } = useI18n();
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
      <div className="label_block">
        <h4>{_('Eco-responsible restaurants')}</h4>
        <span>{_('Selected in patnership with Écotables')}</span>
      </div>
    </button>
  );
};

export default CategoryItem;
