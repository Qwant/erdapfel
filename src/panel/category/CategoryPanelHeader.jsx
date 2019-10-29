/* global _ */
import React from 'react';
import { sources } from 'config/constants.yml';

const CategoryPanelHeader = ({ dataSource }) => {
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
