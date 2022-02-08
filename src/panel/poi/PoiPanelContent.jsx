import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import Telemetry from 'src/libs/telemetry';
import ActionButtons from './ActionButtons';
import PoiBlockContainer from './PoiBlockContainer';
import Contribution from 'src/components/Contribution';
import CategoryList from 'src/components/CategoryList';
import { fire } from 'src/libs/customEvents';
import PoiItem from 'src/components/PoiItem';
import { Divider } from 'src/components/ui';
import { useConfig, useI18n, useFavorites, useDevice } from 'src/hooks';
import { Reservation } from './blocks/Reservation/Reservation';

const PoiPanelContent = ({ poi }) => {
  const { _ } = useI18n();
  const { isInFavorites, removeFromFavorites, addToFavorites } = useFavorites();
  const { enabled: isDirectionActive } = useConfig('direction');
  const hasReservation = poi && poi.className === 'hotel' && poi.meta.source === 'tripadvisor';
  const { isMobile } = useDevice();

  useEffect(() => {
    fire('set_direction_shortcut_callback', openDirection);

    return () => {
      // Clear direction shortcut cb to reset default action
      fire('set_direction_shortcut_callback', null);
    };
  }, [poi, openDirection]);

  const center = () => {
    Telemetry.sendPoiEvent(poi, 'go');
    fire('fit_map', poi);
  };

  const openDirection = useCallback(() => {
    Telemetry.sendPoiEvent(poi, 'itinerary');
    window.app.navigateTo('/routes/', { poi });
  }, [poi]);

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
    Telemetry.sendPoiEvent(poi, 'favorite', { stored: !isInFavorites(poi) });
    if (isInFavorites(poi)) {
      removeFromFavorites(poi);
    } else {
      addToFavorites(poi);
    }
  };

  if (!poi) {
    return null;
  }

  return (
    <div className="poi_panel__content">
      <PoiItem
        poi={poi}
        className="u-mb-l poi-panel-poiItem"
        withAlternativeName
        withOpeningHours
        onClick={center}
      />
      <div className="u-mb-l">
        <ActionButtons
          poi={poi}
          isDirectionActive={isDirectionActive}
          openDirection={openDirection}
          onClickPhoneNumber={onClickPhoneNumber}
          isPoiInFavorite={isInFavorites(poi)}
          toggleStorePoi={toggleStorePoi}
        />
      </div>
      <div className="poi_panel__fullContent">
        {hasReservation && <Reservation url={poi.meta.source_url} mobile={isMobile} />}
        <PoiBlockContainer poi={poi} />
        <Contribution poi={poi} />
        <Divider paddingTop={0} className="poi_panel__fullWidth" />
        <h3 className="u-text--smallTitle u-mb-s">{_('Search around this place', 'poi')}</h3>
        <CategoryList className="poi_panel__categories u-mb-s" limit={4} />
      </div>
    </div>
  );
};

PoiPanelContent.propTypes = {
  poi: PropTypes.object,
};

export default PoiPanelContent;
