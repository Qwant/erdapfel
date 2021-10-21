import React, { useState, useRef, useEffect } from 'react';
import { Flex, Panel, ShareMenu, FloatingButton, CloseButton } from 'src/components/ui';
import MobileRouteDetails from './MobileRouteDetails';
import MobileRoadMapPreview from './MobileRoadMapPreview';
import { getAllSteps } from 'src/libs/route_utils';
import { fire } from 'src/libs/customEvents';
import Telemetry from 'src/libs/telemetry';
import { useI18n } from 'src/hooks';

const MARGIN_TOP_OFFSET = 64; // reserve space to display map

const MobileDirectionPanel = ({
  form,
  result,
  routes,
  origin,
  destination,
  vehicle,
  toggleDetails,
  activeDetails,
  activeRouteId,
  onClose,
  handleShareClick,
}) => {
  const [marginTop, setMarginTop] = useState(0);
  const [activePreviewRoute, setActivePreviewRoute] = useState(null);
  const directionPanelRef = useRef(null);
  const { _ } = useI18n();

  useEffect(() => {
    setActivePreviewRoute(null);
  }, [origin, destination, vehicle]);

  useEffect(() => {
    const marginTop = directionPanelRef.current
      ? directionPanelRef.current.offsetHeight + MARGIN_TOP_OFFSET
      : 0;

    setMarginTop(marginTop);
  }, [directionPanelRef, setMarginTop]);

  const openMobilePreview = route => {
    Telemetry.add(Telemetry.ITINERARY_ROUTE_PREVIEW_OPEN);
    setActivePreviewRoute(route);
  };

  const isFormCompleted = origin && destination;
  const isResultDisplayed = !activePreviewRoute && isFormCompleted;

  return (
    <>
      {!activePreviewRoute && (
        <div className="direction-panel" ref={directionPanelRef}>
          {!isFormCompleted && (
            <Flex
              className="direction-panel-header"
              alignItems="center"
              justifyContent="space-between"
            >
              <h3 className="direction-title u-text--title u-firstCap">
                {_('calculate an itinerary', 'direction')}
              </h3>
              <CloseButton onClick={onClose} />
            </Flex>
          )}
          {form}
          <div className="direction-autocomplete_suggestions" />
        </div>
      )}
      {isResultDisplayed && (
        <Panel
          className="direction-panel-mobile"
          resizable
          fitContent={['default', 'maximized']}
          marginTop={marginTop}
          minimizedTitle={_('Unfold to show the results', 'direction')}
          onClose={onClose}
          isMapBottomUIDisplayed={false}
          floatingItemsRight={[
            <ShareMenu key="action-share" url={window.location.toString()}>
              {openMenu => (
                <FloatingButton
                  title={_('Share itinerary', 'direction')}
                  onClick={e => handleShareClick(e, openMenu)}
                  icon="share-2"
                />
              )}
            </ShareMenu>,
          ]}
          onTransitionEnd={(prevSize, size) => {
            if (prevSize === 'maximized' && size === 'default' && activeRouteId >= 0) {
              fire('set_main_route', { routeId: activeRouteId, fitView: true });
            }
          }}
        >
          {result}
        </Panel>
      )}

      {activePreviewRoute && (
        <MobileRoadMapPreview
          steps={getAllSteps(activePreviewRoute)}
          onClose={() => {
            setActivePreviewRoute(null);
          }}
        />
      )}

      {!activePreviewRoute && activeDetails && activeRouteId >= 0 && routes.length > 0 && (
        <MobileRouteDetails
          id={activeRouteId}
          route={routes[activeRouteId]}
          origin={origin}
          destination={destination}
          vehicle={vehicle}
          toggleDetails={toggleDetails}
          openPreview={() => openMobilePreview(routes[activeRouteId])}
        />
      )}
    </>
  );
};

export default MobileDirectionPanel;
