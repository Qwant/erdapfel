/* global _ */
import React from 'react';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import IconManager from '../adapters/icon_manager';
import Category from 'src/adapters/category';

const ItemLabels = ({ firstLabel, secondLabel }) =>
  <div className="autocomplete_suggestion__lines_container">
    <div className="autocomplete_suggestion__first_line">{firstLabel}</div>
    <div className="autocomplete_suggestion__second_line">{secondLabel}</div>
  </div>;

const GeolocationItem = () =>
  <div
    className="autocomplete_suggestion itinerary_suggest_your_position"
    data-id="geolocalisation"
    data-val={_('Your position', 'direction')}
  >
    <div className="itinerary_suggest_your_position_icon icon-pin_geoloc" />
    {_('Your position', 'direction')}
  </div>;

const CategoryItem = ({ category }) => {
  const { id, label, alternativeName, color, backgroundColor } = category;
  const icon = category.getIcon();

  return (
    <div
      className="autocomplete_suggestion autocomplete_suggestion--category"
      data-id={id}
      data-val={label}
    >
      <div
        style={{ color, backgroundColor }}
        className={`autocomplete-icon autocomplete-icon-rounded icon icon-${icon.iconClass}`}
      />
      <ItemLabels firstLabel={label} secondLabel={alternativeName} />
    </div>
  );
};

const PoiItem = ({ poi }) => {
  const { id, name, className, subClassName, type, alternativeName } = poi;
  const icon = IconManager.get({ className, subClassName, type });

  return (
    <div
      className="autocomplete_suggestion"
      data-id={id}
      data-val={poi.getInputValue()}
    >
      <div
        style={{ color: icon ? icon.color : '' }}
        className={`autocomplete-icon icon icon-${icon.iconClass}`}
      />
      <ItemLabels firstLabel={name} secondLabel={alternativeName} />
    </div>
  );
};

const SeparatorLabel = ({ label }) =>
  <h3 className="autocomplete_suggestion__category_title">
    {label}
  </h3>;

const SuggestItem = ({ item }) => {
  if (item.simpleLabel) {
    return <SeparatorLabel label={item.simpleLabel} />;
  }

  if (item instanceof NavigatorGeolocalisationPoi) {
    return <GeolocationItem />;
  }

  if (item instanceof Category) {
    return <CategoryItem category={item} />;
  }

  return <PoiItem poi={item} />;
};

export default SuggestItem;
