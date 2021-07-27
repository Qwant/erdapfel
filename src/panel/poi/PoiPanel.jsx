import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import Telemetry from 'src/libs/telemetry';
import { shouldShowBackToQwant } from 'src/libs/url_utils';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import Poi from 'src/adapters/poi/poi.js';
import PoiPanelContent from './PoiPanelContent';
import { fire } from 'src/libs/customEvents';
import { Panel, PanelNav, Button } from 'src/components/ui';
import { BackToQwantButton } from 'src/components/BackToQwantButton';
import { useDevice, useI18n, usePageTitle } from 'src/hooks';
import { PoiContext } from 'src/libs/poiContext';

const PoiPanel = ({ poi, poiId, backAction, inList, centerMap }) => {
  const { activePoi, setActivePoi } = useContext(PoiContext);
  const { isMobile } = useDevice();
  const { _ } = useI18n();

  usePageTitle((activePoi || poi)?.name);

  useEffect(() => {
    return () => {
      setActivePoi(null);
    };
  }, [setActivePoi]);

  useEffect(() => {
    // direction shortcut will be visible in minimized state
    fire('mobile_direction_button_visibility', false);

    return () => {
      fire('move_mobile_bottom_ui', 0);
      fire('mobile_direction_button_visibility', true);
    };
  }, []);

  useEffect(() => {
    const mapPoi = poi || activePoi;
    if (mapPoi) {
      window.execOnMapLoaded(() => {
        if (inList) {
          fire('click_category_marker', mapPoi);
        } else {
          fire('create_poi_marker', mapPoi);
        }
        fire('ensure_poi_visible', mapPoi, { centerMap });
      });
    }

    return () => {
      fire('clean_marker');
    };
  }, [poi, activePoi, inList, centerMap]);

  useEffect(() => {
    const loadPoi = async () => {
      const shallowPoi = poi && Poi.deserialize(poi);

      // @TODO: use a global POI context instead
      let idunnPoi;
      if (window.hotLoadPoi && window.hotLoadPoi.id === poiId) {
        Telemetry.add(Telemetry.POI_RESTORE);
        idunnPoi = new IdunnPoi(window.hotLoadPoi);
      } else {
        idunnPoi = await IdunnPoi.poiApiLoad(poi || { id: poiId });
      }

      // fallback on the simple POI object from the map
      // if Idunn doesn't know this POI
      const bestPoi = idunnPoi || shallowPoi;

      if (!bestPoi) {
        // @TODO: error message instead of close in case of unrecognized POI
        closeAction();
      } else {
        setActivePoi(bestPoi);
      }
    };

    loadPoi();
  }, [poi, poiId, setActivePoi]);

  const closeAction = () => {
    window.app.navigateTo('/');
  };

  const onBack = backAction || closeAction;

  const renderHeader = () => {
    if (isMobile) {
      return null;
    }

    if (shouldShowBackToQwant()) {
      return (
        <PanelNav>
          <BackToQwantButton />
        </PanelNav>
      );
    }

    // If source is a PoI list: show a button to return to the list
    if (onBack !== closeAction) {
      return (
        <PanelNav>
          <Button icon="arrow-left" variant="tertiary" onClick={onBack}>
            {_('Display all results')}
          </Button>
        </PanelNav>
      );
    }

    return null;
  };

  return (
    <Panel
      resizable
      fitContent={['default', 'minimized']}
      className="poi_panel"
      renderHeader={renderHeader()}
      floatingItemsLeft={
        isMobile && shouldShowBackToQwant() && [<BackToQwantButton key="back-to-qwant" isMobile />]
      }
    >
      <PoiPanelContent poi={activePoi || poi} />
    </Panel>
  );
};

PoiPanel.propTypes = {
  poiId: PropTypes.string.isRequired,
  poi: PropTypes.object,
  backAction: PropTypes.func,
  inList: PropTypes.bool,
  centerMap: PropTypes.bool,
};

export default PoiPanel;
