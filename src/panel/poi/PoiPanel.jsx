import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Telemetry from 'src/libs/telemetry';
import { shouldShowBackToQwant } from 'src/libs/url_utils';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import Poi from 'src/adapters/poi/poi.js';
import PoiPanelContent from './PoiPanelContent';
import { fire } from 'src/libs/customEvents';
import { Panel, PanelNav, Button } from 'src/components/ui';
import { BackToQwantButton } from 'src/components/BackToQwantButton';
import { useDevice, useI18n } from 'src/hooks';

const PoiPanel = ({ poi, poiId, backAction, inList }) => {
  const { isMobile } = useDevice();
  const [fullPoi, setFullPoi] = useState(poi);
  const { _ } = useI18n();

  useEffect(() => {
    if (fullPoi) {
      window.execOnMapLoaded(() => {
        if (inList) {
          fire('click_category_marker', fullPoi);
        } else {
          fire('create_poi_marker', fullPoi);
        }
        fire('ensure_poi_visible', fullPoi, {});
      });
    }

    return () => {
      fire('clean_marker');
    };
  }, [fullPoi, inList]);

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
        setFullPoi(bestPoi);
      }
    };

    loadPoi();
  }, [poi, poiId, inList]);

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
      <PoiPanelContent poi={fullPoi} />
    </Panel>
  );
};

PoiPanel.propTypes = {
  poiId: PropTypes.string.isRequired,
  poi: PropTypes.object,
  backAction: PropTypes.func,
  inList: PropTypes.bool,
};

export default PoiPanel;
