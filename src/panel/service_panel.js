/* globals _ */
import React from 'react';
import ReactDOM from 'react-dom';
import CategoryService from '../adapters/category_service';

const ServicePanel_ = ({ categories, navTo }) =>
  <div className="service_panel service_panel--active">
    <h3 className="service_panel__title">
      {_('Qwant Maps services', 'service panel')}
    </h3>

    {/* TODO: use real <a> links */}
    <div
      className="service_panel__item service_panel__item__fav"
      onClick={() => navTo('/favs') }
    >
      <button className="service_panel__item__action">
        <i className="icon-icon_star side_bar__item__icon"></i>
        <span className="service_panel__item__text">{_('YOUR FAVORITES', 'service panel')}</span>
      </button>
    </div>

    <div
      className="service_panel__item service_panel__item__direction"
      onClick={() => navTo('/routes') }
    >
      <button className="service_panel__item__action">
        <i className="icon-corner-up-right side_bar__item__icon"></i>
        <span className="service_panel__item__text">{_('DIRECTIONS', 'service panel')}</span>
      </button>
    </div>

    {categories.length > 0 && <div className="service_panel__categories">
      {categories.map(category =>
        <button
          key={category.label} className="service_panel__category" type="button"
          onClick={() => navTo(`/places/?type=${category.name}`) }
        >
          <div className="service_panel__category__icon" style={{
            background: category.backgroundColor,
          }}>
            <span className={`icon icon-${category.iconName}`} />
          </div>
          <div className="service_panel__category__title">{category.label}</div>
        </button>)
      }
    </div>}
  </div>;

// Just a facade component to make the dot<=>React link
// Won't be needed when all panels are migrated
export default class ServicePanel {
  constructor() {
    this.categories = CategoryService.getCategories();
  }

  open() {
    ReactDOM.render(
      <ServicePanel_
        categories={this.categories}
        navTo={url => {
          window.app.navigateTo(url);
        }}
      />,
      document.querySelector('.service_panel__container')
    );
  }

  close() {
    ReactDOM.unmountComponentAtNode(document.querySelector('.service_panel__container'));
  }
}
