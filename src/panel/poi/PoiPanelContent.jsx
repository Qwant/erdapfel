import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Telemetry from 'src/libs/telemetry';
import ActionButtons from './ActionButtons';
import PoiBlockContainer from './PoiBlockContainer';
import OsmContribution from 'src/components/OsmContribution';
import CategoryList from 'src/components/CategoryList';
import { isFromPagesJaunes, isFromOSM } from 'src/libs/pois';
import { fire, listen, unListen } from 'src/libs/customEvents';
import { addToFavorites, removeFromFavorites, isInFavorites } from 'src/adapters/store';
import PoiItem from 'src/components/PoiItem';
import { Flex, Divider } from 'src/components/ui';
import { useConfig, useI18n } from 'src/hooks';

const PoiPanelContent = ({ poi }) => {
  const { _ } = useI18n();
  const [isPoiInFavorite, setPoiInFavorite] = useState(isInFavorites(poi));
  const { enabled: isDirectionActive } = useConfig('direction');

  useEffect(() => {
    // direction shortcut will be visible in minimized state
    fire('mobile_direction_button_visibility', false);
    fire('set_direction_shortcut_callback', openDirection);

    // @TODO: use a global favorite context
    const storePoiChangeHandler = listen(
      'poi_favorite_state_changed',
      (changedFavPoi, isPoiInFavorite) => {
        if (changedFavPoi === poi) {
          setPoiInFavorite(isPoiInFavorite);
        }
      }
    );

    return () => {
      unListen(storePoiChangeHandler);
      fire('move_mobile_bottom_ui', 0);
      fire('mobile_direction_button_visibility', true);
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
    Telemetry.sendPoiEvent(poi, 'favorite', { stored: !isPoiInFavorite });
    if (isPoiInFavorite) {
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
      <Flex alignItems="flex-start" justifyContent="space-between">
        <PoiItem
          poi={poi}
          className="u-mb-l poi-panel-poiItem"
          withAlternativeName
          withOpeningHours
          onClick={center}
        />
      </Flex>
      <div className="u-mb-l">
        <ActionButtons
          poi={poi}
          isDirectionActive={isDirectionActive}
          openDirection={openDirection}
          onClickPhoneNumber={onClickPhoneNumber}
          isPoiInFavorite={isPoiInFavorite}
          toggleStorePoi={toggleStorePoi}
        />
      </div>
      <div className="poi_panel__fullContent">
        <PoiBlockContainer poi={poi} />
        {isFromPagesJaunes(poi) && (
          <div className="poi_panel__info-partnership u-text--caption u-mb-s">
            {_('In partnership with')}
            <img src="./statics/images/pj.svg" alt="PagesJaunes" width="80" height="16" />
          </div>
        )}
        {isFromOSM(poi) && <OsmContribution poi={poi} />}
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
