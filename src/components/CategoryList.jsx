import React from 'react';
import CategoryService from 'src/adapters/category_service';

const CategoryList = ({ className }) =>
  <div className={className}>
    {CategoryService.getCategories().map(category =>
      <button className="service_panel__category"
        key={category.name}
        type="button"
        onClick={() => { window.app.navigateTo(`/places/?type=${category.name}`); }}
      >
        <div className="service_panel__category__icon"
          style={{ background: category.backgroundColor }}
        >
          <span className={`icon icon-${category.iconName}`} />
        </div>
        <div className="service_panel__category__title">{category.label}</div>
      </button>)
    }
  </div>;

export default CategoryList;
