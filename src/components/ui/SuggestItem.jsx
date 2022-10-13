import React, { useState } from 'react';
import classnames from 'classnames';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import Category from 'src/adapters/category';
import Intention from 'src/adapters/intention';
import { Address } from 'src/components/ui';
import PlaceIcon from 'src/components/PlaceIcon';
import PoiStore from 'src/adapters/poi/poi_store';
import NoResultMessage from 'src/panel/NoResultMessage';
import { deleteQuery, getQueryType } from 'src/adapters/search_history';
import { useI18n } from 'src/hooks';
import { IconEmpty, Flex } from '@qwant/qwant-ponents';
import { GREY_SEMI_DARKNESS } from '../../libs/colors';

const SuggestItem = ({ item }) => {
  const { _ } = useI18n();
  const [removed, setRemoved] = useState(false);

  if (item.errorLabel) {
    return (
      <div className="autocomplete_error">
        <NoResultMessage />
      </div>
    );
  }

  if (removed) {
    return false;
  }

  let category,
    firstLabel,
    secondLabel,
    place = item,
    backgroundIcon = true;
  const props = {};
  const variants = [];
  const isHistory = item._suggestSource === 'history';
  const isFavorite = item instanceof PoiStore === true;
  if (isFavorite) {
    variants.push('favorite');
  } else if (isHistory) {
    variants.push('history');
  }

  const removeFromHistory = e => {
    // Prevent the input field from losing focus, therefore hiding the panel
    e.preventDefault();
    // Prevent triggering the mouse down action on the parent
    e.stopPropagation();
    deleteQuery({ item, type: getQueryType(item) }, true);
    setRemoved(true);
  };

  if (item instanceof NavigatorGeolocalisationPoi) {
    firstLabel = _('Your position', 'direction');
    variants.push('geoloc');
  } else if (item instanceof Category) {
    category = item;
    place = null;
    props['data-id'] = item.id;
    variants.push('category');
    firstLabel = item.label;
    secondLabel = item.alternativeName;
  } else if (item instanceof Intention) {
    place = null;
    category = item.category;
    variants.push('intention');
    firstLabel = item.category?.label || item.fullTextQuery;
    secondLabel = item.place
      ? `${_('Close to')} ${item.place.properties.geocoding.name}`
      : _('nearby');
  } else {
    backgroundIcon = false;
    const streetAddress = item.alternativeName ? ( // fallback to alternativeName for older favorites
      item.alternativeName
    ) : (
      <Address
        address={item.address}
        omitStreet={item.type === 'house' || item.type === 'street'}
        inline
      />
    );
    firstLabel = item.name;
    if (!isFavorite && !isHistory) {
      secondLabel = streetAddress;
    }
  }

  return (
    <div
      className={classnames(
        'autocomplete_suggestion',
        variants.map(variant => `autocomplete_suggestion--${variant}`)
      )}
      {...props}
    >
      <PlaceIcon
        className="autocomplete_suggestion_icon"
        place={place}
        category={category}
        withBackground={backgroundIcon}
        isFavorite={isFavorite}
        isHistory={isHistory}
      />
      <div className="autocomplete_suggestion__labels">
        <div className="autocomplete_suggestion__first_line">{firstLabel}</div>
        {secondLabel && <div className="autocomplete_suggestion__second_line">{secondLabel}</div>}
      </div>
      {isHistory && (
        <Flex ml="s">
          <IconEmpty
            width={20}
            fill={GREY_SEMI_DARKNESS}
            onMouseDown={removeFromHistory}
            title={_('Delete')}
          />
        </Flex>
      )}
    </div>
  );
};

export default SuggestItem;
