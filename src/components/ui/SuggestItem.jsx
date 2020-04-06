/* global _ */
import React from 'react';
import classNames from 'classnames';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import IconManager from '../../adapters/icon_manager';
import Category from 'src/adapters/category';

const ItemLabels = ({ firstLabel, secondLabel }) =>
  <div className="autocomplete_suggestion__lines_container">
    <div className="autocomplete_suggestion__first_line">{firstLabel}</div>
    <div className="autocomplete_suggestion__second_line">{secondLabel}</div>
  </div>;

const GeolocationItem = ({ isHighlighted }) =>
  <div
    className={classNames(
      'autocomplete_suggestion itinerary_suggest_your_position',
      { 'selected': isHighlighted }
    )}
    data-id="geolocalisation"
    data-val={_('Your position', 'direction')}
  >
    <div className="itinerary_suggest_your_position_icon icon-pin_geoloc" />
    {_('Your position', 'direction')}
  </div>;

const CategoryItem = ({ category, isHighlighted }) => {
  const { id, label, alternativeName, color, backgroundColor } = category;
  const icon = category.getIcon();

  return (
    <div
      className={classNames(
        'autocomplete_suggestion autocomplete_suggestion--category',
        { 'selected': isHighlighted }
      )}
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

const PoiItem = ({ poi, isHighlighted }) => {
  const { id, name, className, subClassName, type, alternativeName } = poi;
  const icon = IconManager.get({ className, subClassName, type });

  return (
    <div
      className={classNames('autocomplete_suggestion', { 'selected': isHighlighted })}
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

const SuggestItem = ({ item, isHighlighted }) => {
  if (item.simpleLabel) {
    return <SeparatorLabel label={item.simpleLabel} />;
  }

  if (item instanceof NavigatorGeolocalisationPoi) {
    return <GeolocationItem isHighlighted={isHighlighted}/>;
  }

  if (item instanceof Category) {
    return <CategoryItem category={item} isHighlighted={isHighlighted} />;
  }

  return <PoiItem poi={item} isHighlighted={isHighlighted} />;
};

export default SuggestItem;
