/* globals _ */
import React from 'react';
import ReactDOM from 'react-dom';
import CategoryService from '../adapters/category_service';

// Returns a function, which when called will navigate to the url
const navTo = url => () => {
  window.app.navigateTo(url);
};

const CategoryButton = ({ category }) => {
  return <button
    className="service_panel__category"
    type="button"
    onClick={navTo(`/places/?type=${category.name}`) }
  >
    <div className="service_panel__category__icon" style={{
      background: category.backgroundColor,
    }}>
      <span className={`icon icon-${category.iconName}`} />
    </div>
    <div className="service_panel__category__title">{category.label}</div>
  </button>;
};

class ServicePanel extends React.Component {
  render() {
    const categories = this.props.categories;

    return <div className="service_panel">
      <h3 className="service_panel__title">{_('Qwant Maps services', 'service panel')}</h3>

      {/* TODO: use real links instead of all these buttons */}

      <div className="service_panel__actions">
        <button
          className="service_panel__action service_panel__item__fav"
          onClick={navTo('/favs') }
        >
          <i className="icon-icon_star" />{' '}
          <span className="service_panel__action__text">
            {_('YOUR FAVORITES', 'service panel')}
          </span>
        </button>

        <button
          className="service_panel__action service_panel__item__direction"
          onClick={navTo('/routes') }
        >
          <i className="icon-corner-up-right" />{' '}
          <span className="service_panel__action__text">
            {_('DIRECTIONS', 'service panel')}
          </span>
        </button>
      </div>

      {categories.length > 0 && <div className="service_panel__categories">
        {categories.map(category => <CategoryButton key={category.label} category={category} />) }
      </div>}
    </div>;
  }
}

// Just a facade component to make the dot<=>React link
// Won't be needed when all panels are migrated
export default class _ServicePanel {
  constructor(containerSelector) {
    this.containerSelector = containerSelector;
  }

  open() {
    ReactDOM.render(
      <ServicePanel categories={CategoryService.getCategories()} />,
      document.querySelector(this.containerSelector)
    );
  }

  close() {
    ReactDOM.unmountComponentAtNode(document.querySelector(this.containerSelector));
  }
}
