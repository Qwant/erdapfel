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
import { PanelContext } from 'src/libs/panelContext.js';
import NoResultPanel from 'src/panel/NoResultPanel';
import TopBar from 'src/components/TopBar';
import { useConfig, useDevice } from 'src/hooks';
import { PoiContext } from 'src/libs/poiContext';
import { getListDescription } from 'src/libs/poiList';

function getTopBarAppValue(poi, category, query) {
  return poi?.name || getListDescription(category, query) || '';
}

const PanelManager = () => {
  const directionConf = useConfig('direction');
  const { isMobile } = useDevice();
  const { activePoi } = useContext(PoiContext);
  const { pathname, search: queryString, state: historyState = {} } = useLocation();
  const searchParams = parseQueryString(queryString);
  const poiFilters = historyState.poiFilters || {};

  const [panelSize, setPanelSize] = useState('default');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [topBarValue, setTopBarValue] = useState('');

  const mainSearchInputRef = useRef(null);

  // Telemetry
  useEffect(() => {
    window.times.appRendered = Date.now();

    const initialUrlPathName = pathname;
    const initialQueryParams = searchParams;

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

  useEffect(() => {
    setTopBarValue(
      getTopBarAppValue(
        activePoi || historyState.poi,
        poiFilters.category || searchParams.type,
        poiFilters.query || searchParams.q
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, queryString, activePoi]);

  useEffect(() => {
    // Not in a "list of PoI" context
    if (!poiFilters.category && !poiFilters.query) {
      // Markers are not persistent
      fire('remove_category_markers');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, queryString]);

  const backToList = (e, poiFilters) => {
    e.stopPropagation();
    const { query, category, ...rest } = poiFilters;
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

  let backAction = null;
  if (poiFilters.category || poiFilters.query) {
    backAction = e => backToList(e, poiFilters);
  } else if (historyState.isFromFavorite) {
    backAction = backToFavorite;
  }
  let topBarReturnAction = null;
  if (historyState.poi?.name) {
    // use the mousedown event so it's triggered before the blur event on the suggest
    topBarReturnAction = event => {
      if (isSuggestOpen) {
        return;
      }
      backAction(event);
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
              <PoiPanel backAction={backAction} />
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
