import React from 'react';
import PoiItem from './PoiItem';
import { fire } from 'src/libs/customEvents';
import ActionButtons from '../panel/poi/ActionButtons';
import nconf from '@qwant/nconf-getter';
import Telemetry from '../libs/telemetry';
import { addToFavorites, isInFavorites, removeFromFavorites } from '../adapters/store';

const PoiPopup = ({ poi }) => {
  const isDirectionActive = nconf.get().direction.enabled;

  const openDirection = () => {
    Telemetry.sendPoiEvent(poi, 'itinerary');
    window.app.navigateTo('/routes/', { poi });
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
    const inFavorites = isInFavorites(poi);
    Telemetry.sendPoiEvent(poi, 'favorite', { stored: !inFavorites });
    if (inFavorites) {
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
