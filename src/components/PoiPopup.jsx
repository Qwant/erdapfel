import React from 'react';
import { useHistory } from 'react-router-dom';
import PoiItem from './PoiItem';
import { fire } from 'src/libs/customEvents';
import ActionButtons from '../panel/poi/ActionButtons';
import Telemetry from '../libs/telemetry';
import { useConfig, useFavorites } from '../hooks';

const PoiPopup = ({ poi }) => {
  const { isInFavorites, removeFromFavorites, addToFavorites } = useFavorites();
  const isDirectionActive = useConfig('direction').enabled;
  const history = useHistory();

  const openDirection = () => {
    Telemetry.sendPoiEvent(poi, 'itinerary');
    history.push('/routes/', { poi });
  };

  const onClickPhoneNumber = () => {
    const source = poi.meta && poi.meta.source;
    if (source) {
      Telemetry.sendPoiEvent(
        poi,
        'phone',
        Telemetry.buildInteractionData({
          id: poi.id,
          source,
          template: 'single',
          zone: 'detail',
          element: 'phone',
        })
      );
    }
  };

  const toggleStorePoi = () => {
    const isFavorite = isInFavorites(poi);
    Telemetry.sendPoiEvent(poi, 'favorite', { stored: !isFavorite });
    if (isFavorite) {
      removeFromFavorites(poi);
    } else {
      addToFavorites(poi);
    }
  };

  return (
    <div
      className="poi_popup"
      onMouseEnter={() => {
        fire('stop_close_popup_timeout');
      }}
      onMouseLeave={() => {
        fire('close_popup');
      }}
    >
      <div className="u-mb-s">
        <PoiItem poi={poi} withOpeningHours withImage inList />
      </div>
      <ActionButtons
        poi={poi}
        isDirectionActive={isDirectionActive}
        openDirection={openDirection}
        onClickPhoneNumber={onClickPhoneNumber}
        isPoiInFavorite={isInFavorites(poi)}
        toggleStorePoi={toggleStorePoi}
      />
    </div>
  );
};

export default PoiPopup;
