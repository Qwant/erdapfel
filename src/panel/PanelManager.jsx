import React, { useEffect, useRef, useState, useContext } from 'react';
import { Switch, Route, useLocation, useRouteMatch } from 'react-router-dom';
import { navTo } from 'src/proxies/app_router';
import FavoritesPanel from './favorites/FavoritesPanel';
import PoiPanel from './poi/PoiPanel';
import ServicePanel from './service/ServicePanel';
import CategoryPanel from 'src/panel/category/CategoryPanel';
import DirectionPanel from 'src/panel/direction/DirectionPanel';
import Telemetry from 'src/libs/telemetry';
import { parseQueryString, buildQueryString } from 'src/libs/url_utils';
import { fire, listen, unListen } from 'src/libs/customEvents';
import { removeNullEntries } from 'src/libs/object';
import { PanelContext } from 'src/libs/panelContext.js';
import NoResultPanel from 'src/panel/NoResultPanel';
import TopBar from 'src/components/TopBar';
import { useConfig, useDevice } from 'src/hooks';
import { PoiContext } from 'src/libs/poiContext';
import { getListDescription } from 'src/libs/poiList';

function getTopBarAppValue(activePoi, { poi = {}, category, query } = {}) {
  return poi?.name || activePoi?.name || getListDescription(category, query) || '';
}

const getAggregatedHistoryState = ({ state, search }) => {
  const { q: query, type: category } = parseQueryString(search);
  return {
    ...state,
    ...removeNullEntries({ query, category }),
  };
};

const PanelManager = () => {
  const directionConf = useConfig('direction');
  const { isMobile } = useDevice();
  const { activePoi } = useContext(PoiContext);
  const location = useLocation();
  const historyState = getAggregatedHistoryState(location);

  const [panelSize, setPanelSize] = useState('default');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [topBarValue, setTopBarValue] = useState('');

  const mainSearchInputRef = useRef(null);

  // Telemetry
  useEffect(() => {
    window.times.appRendered = Date.now();

    const initialUrlPathName = window.location.pathname;
    const initialQueryParams = parseQueryString(window.location.search);

    Telemetry.add(Telemetry.APP_START, {
      language: window.getLang(),
      is_mobile: isMobile,
      url_pathname: initialUrlPathName,
      url_client: initialQueryParams['client'] || null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Disable ESlint plugin so we don't need to add 'isMobile' as effect dependency,
  // to prevent sending the event again if the user resizes the app

  // Panel auto-minimization on mobile
  useEffect(() => {
    if (isMobile) {
      const minimizePanelOnMapInteraction = listen('map_user_interaction', () => {
        if (panelSize !== 'minimized') {
          setPanelSize('minimized');
        }
        fire('restart_idle_timeout');
      });
      return () => {
        unListen(minimizePanelOnMapInteraction);
      };
    }
  }, [isMobile, panelSize, setPanelSize]);

  // Effects on panel change
  useEffect(() => {
    setTopBarValue(getTopBarAppValue(activePoi, historyState));

    // Not in a "list of PoI" context
    if (!historyState.category && !historyState.query) {
      // Markers are not persistent
      fire('remove_category_markers');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, activePoi]);

  const backToList = (e, historyState) => {
    e.stopPropagation();
    const { query, category, ...rest } = historyState;
    const queryObject = {
      q: query,
      type: category,
      ...rest,
    };

    Telemetry.add(Telemetry.POI_BACKTOLIST);
    fire('restore_location');
    navTo(`/places/${buildQueryString(queryObject)}`);
  };

  const backToFavorite = e => {
    e.stopPropagation();
    Telemetry.add(Telemetry.POI_BACKTOFAVORITE);
    navTo('/favs');
  };

  let topBarReturnAction = null;
  const { poi, category, query, isFromFavorite } = historyState;
  if (poi?.name && (category || query || isFromFavorite)) {
    const backAction = category || query ? backToList : backToFavorite;
    // use the mousedown event so it's triggered before the blur event on the suggest
    topBarReturnAction = event => {
      if (isSuggestOpen) {
        return;
      }
      backAction(event, historyState);
    };
  }

  const { isExact: isServicePanel } = useRouteMatch('/');
  const isPanelVisible = !isSuggestOpen || (isServicePanel && !topBarValue);

  return (
    <div>
      <TopBar
        value={topBarValue}
        setUserInputValue={setTopBarValue}
        ref={mainSearchInputRef}
        onSuggestToggle={setIsSuggestOpen}
        backButtonAction={topBarReturnAction}
      />
      <PanelContext.Provider value={{ size: panelSize, setSize: setPanelSize }}>
        {/*
          The panel container is made hidden using "display: none;" to avoid unnecessary
          mounts and unmounts of the active panel, that would have inappropriate side effects
          on map markers, requests to server, etc.
        */}
        <div className="panel_container" style={{ display: !isPanelVisible ? 'none' : null }}>
          <Switch>
            <Route path="/places/">
              <CategoryPanel />
            </Route>
            <Route path="/place/:poiDesc">
              <PoiPanel backToList={backToList} backToFavorite={backToFavorite} />
            </Route>
            {directionConf.enabled && (
              <Route path="/routes">
                <DirectionPanel />
              </Route>
            )}
            <Route path="/favs">
              <FavoritesPanel />
            </Route>
            <Route path="/noresult">
              <NoResultPanel
                resetInput={() => {
                  setTopBarValue('');
                  mainSearchInputRef.current.select();
                }}
              />
            </Route>
            <Route path="/">
              <ServicePanel />
            </Route>
          </Switch>
        </div>
      </PanelContext.Provider>
    </div>
  );
};

export default PanelManager;
