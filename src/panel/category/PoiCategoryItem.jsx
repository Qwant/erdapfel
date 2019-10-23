import React from 'react';

const PoiCategoryItem = ({ poi }) => {
  return <div className="category__panel__item">
    <h3 className="category__panel__name">{poi.getInputValue()}</h3>
  </div>;
};

export default PoiCategoryItem;
