/* global _ */
import React from 'react';
import { sources } from 'config/constants.yml';
import PlaceholderText from 'src/components/ui/PlaceholderText';

const CategoryPanelHeader = ({ loading, dataSource }) => {
  if (loading) {
    return <div className="category__panel__pj">
      <PlaceholderText length={10} />
      <PlaceholderText length={7} />
    </div>;
  }

  if (dataSource === sources.pagesjaunes) {
    return <div className="category__panel__pj">
      <div className="category__panel__pj_title">
        {_('PAGES JAUNES', 'categories')}
      </div>
      <div className="category__panel__pj_partnership">
        {_('Partnership', 'categories')}
      </div>
    </div>;
  }

  return '';
};

export default CategoryPanelHeader;
