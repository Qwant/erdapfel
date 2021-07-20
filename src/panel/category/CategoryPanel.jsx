/* global _ */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';

import PoiItemList from './PoiItemList';
import PoiItemListPlaceholder from './PoiItemListPlaceholder';
import CategoryPanelError from './CategoryPanelError';
import Telemetry from 'src/libs/telemetry';
import { useConfig, useDevice, usePageTitle } from 'src/hooks';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import { getVisibleBbox } from 'src/panel/layouts';
import { fire, listen, unListen } from 'src/libs/customEvents';
import { boundsFromFlatArray, parseBboxString, boundsToString } from 'src/libs/bounds';
import classnames from 'classnames';
import { sources } from 'config/constants.yml';
import { BackToQwantButton } from 'src/components/BackToQwantButton';
import { shouldShowBackToQwant } from 'src/libs/url_utils';
import { Panel, PanelNav, SourceFooter, UserFeedbackYesNo } from 'src/components/ui';
import { capitalizeFirst } from 'src/libs/string';

const DEBOUNCE_WAIT = 100;

function fitMap(bbox) {
  if (bbox) {
    try {
      fire('fit_map', parseBboxString(bbox));
      return;
    } catch (e) {
      console.error(e);
    }
  }

  const mapboxMap = window.map.mb;

  if (mapboxMap.isMoving && mapboxMap.isMoving()) {
    // Do not trigger API search and zoom change
    // when the map is already moving, to avoid flickering.
    // The search will be triggered on moveend.
    return;
  }

  // Apply correct zoom when opening a category
  const currentZoom = mapboxMap.getZoom();

  // Zoom < 5: focus on Paris
  if (currentZoom < 5) {
    mapboxMap.flyTo({ center: [2.35, 48.85], zoom: 12 });
  } else if (currentZoom < 12) {
    // Zoom < 12: zoom up to zoom 12
    mapboxMap.flyTo({ zoom: 12 });
  } else if (currentZoom > 18) {
    // Zoom > 18: dezoom to zoom 18
    mapboxMap.flyTo({ zoom: 18 });
  } else {
    // setting the same view still triggers the moveend event
    mapboxMap.jumpTo({ zoom: currentZoom, center: mapboxMap.getCenter() });
  }
}

const CategoryPanel = ({ poiFilters = {}, bbox }) => {
  const [pois, setPois] = useState([]);
  const [dataSource, setDataSource] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const { isMobile } = useDevice();
  const { maxPlaces } = useConfig('category');

  usePageTitle(capitalizeFirst(poiFilters.category || poiFilters.query));

  useEffect(() => {
    const fetchData = debounce(
      async () => {
        const { category, query } = poiFilters;
        const currentBounds = getVisibleBbox(window.map.mb);

        const extendBbox = initialLoading;
        const { places, source, bbox: contentBbox, bbox_extended } = await IdunnPoi.poiCategoryLoad(
          boundsToString(currentBounds),
          maxPlaces,
          category,
          query,
          extendBbox
        );

        setPois(places);
        setDataSource(source);
        setInitialLoading(false);

        if (bbox_extended && contentBbox) {
          // The returned bbox is sure to contain at least one POI.
          // Extend the current one to include it.
          fire('fit_map', currentBounds.extend(boundsFromFlatArray(contentBbox)), true);
        }

        fire('add_category_markers', places, poiFilters);
        fire('save_location');
      },
      DEBOUNCE_WAIT,
      { leading: true }
    );

    const mapMoveHandler = listen('map_moveend', fetchData);
    return () => {
      unListen(mapMoveHandler);
    };
  }, [poiFilters, initialLoading, maxPlaces]);

  useEffect(() => {
    window.execOnMapLoaded(() => {
      fitMap(bbox);
    });
  }, [bbox, poiFilters]);

  useEffect(() => {
    setInitialLoading(true);
  }, [poiFilters]);

  useEffect(() => {
    if (poiFilters.category) {
      Telemetry.add(Telemetry.POI_CATEGORY_OPEN, { category: poiFilters.category });
    }
  }, [poiFilters.category]);

  const selectPoi = poi => {
    fire('click_category_poi', { poi, poiFilters, pois });
  };

  const highlightPoiMarker = (poi, highlight) => {
    fire('highlight_category_marker', poi, highlight);
  };

  let panelContent;

  if (initialLoading) {
    panelContent = <PoiItemListPlaceholder />;
  } else if (!pois || pois.length === 0) {
    panelContent = <CategoryPanelError zoomIn={!pois} />;
  } else {
    panelContent = (
      <>
        <PoiItemList pois={pois} selectPoi={selectPoi} highlightMarker={highlightPoiMarker} />
        <UserFeedbackYesNo
          questionId="poi-list"
          context={document.location.href}
          question={_('Satisfied with the results?')}
        />
        {dataSource === sources.pagesjaunes && (
          <SourceFooter>{_('Results in partnership with PagesJaunes', 'categories')}</SourceFooter>
        )}
      </>
    );
  }

  const NavHeader = () => {
    if (isMobile || !shouldShowBackToQwant()) {
      return null;
    }

    return (
      <PanelNav>
        <BackToQwantButton />
      </PanelNav>
    );
  };

  return (
    <Panel
      resizable
      renderHeader={<NavHeader isMobile={isMobile} />}
      minimizedTitle={_('Unfold to show the results', 'categories')}
      className={classnames('category__panel', { 'panel--pj': dataSource === sources.pagesjaunes })}
      floatingItemsLeft={[
        isMobile && shouldShowBackToQwant() && <BackToQwantButton key="back-to-qwant" isMobile />,
      ]}
      fitContent={!pois || pois.length === 0 ? ['default'] : []}
    >
      {panelContent}
    </Panel>
  );
};

CategoryPanel.propTypes = {
  poiFilters: PropTypes.object,
  bbox: PropTypes.string,
};

export default CategoryPanel;
