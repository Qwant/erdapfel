/* global _ */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Panel from 'src/components/ui/Panel';
import PoiItemList from './PoiItemList';
import PoiItemListPlaceholder from './PoiItemListPlaceholder';
import CategoryPanelError from './CategoryPanelError';
import CategoryPanelHeader from './CategoryPanelHeader';
import Telemetry from 'src/libs/telemetry';
import SearchInput from 'src/ui_components/search_input';
import nconf from '@qwant/nconf-getter';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import CategoryService from 'src/adapters/category_service';
import { getVisibleBbox } from 'src/panel/layouts';
import { fire, listen, unListen } from 'src/libs/customEvents';
import { capitalizeFirst } from 'src/libs/string';

const categoryConfig = nconf.get().category;
const MAX_PLACES = Number(categoryConfig.maxPlaces);

const Result = ({ pois, poiFilters }) => {
  const hasError = !pois || pois.length === 0;
  return hasError
    ? <CategoryPanelError zoomIn={!pois} />
    : <PoiItemList
      pois={pois}
      selectPoi={poi => { fire('click_category_poi', poi, poiFilters); }}
      highlightMarker={(poi, highlight) => { fire('highlight_category_marker', poi, highlight); }}
    />;
};

const CategoryPanel = ({ poiFilters = {}, bbox = '' }) => {
  const [pois, setPois] = useState([]);
  const [dataSource, setDataSource] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const mapMoveHandler = listen('map_moveend', fetchData);

    return function unmount() {
      unListen(mapMoveHandler);
    };
  }, []);

  useEffect(() => {
    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
      panelContent.scrollTop = 0;
    }

    const { category, query } = poiFilters;
    if (category) {
      Telemetry.add(Telemetry.POI_CATEGORY_OPEN, null, null, { category });
      const { label } = CategoryService.getCategoryByName(category);
      SearchInput.setInputValue(capitalizeFirst(label));
    } else if (query) {
      SearchInput.setInputValue(query);
    }

    window.execOnMapLoaded(fitMap);

    return function unmount() {
      SearchInput.setInputValue('');
    };
  }, [poiFilters, bbox]);

  function fitMap() {
    const map = window.map.mb;
    // @TODO: put bbox parsing in a dedicated lib
    const rawBbox = bbox.split(',');
    const mapBbox = rawBbox.length === 4 && [[rawBbox[0], rawBbox[1]], [rawBbox[2], rawBbox[3]]];
    if (mapBbox) {
      map.fitBounds(mapBbox, { animate: false });
      return;
    }

    if (map.isMoving()) {
      // If the map is already moving, let it finish its transition.
      // The data loading will be triggered on moveend.
      return;
    }

    // Apply correct zoom when opening a category
    const currentZoom = map.getZoom();

    // Zoom < 5: focus on Paris
    if (currentZoom < 5) {
      map.flyTo({ center: [2.35, 48.85], zoom: 12 });
    } else if (currentZoom < 12) { // Zoom < 12: zoom up to zoom 12
      map.flyTo({ zoom: 12 });
    } else if (currentZoom > 16) { // Zoom > 16: dezoom to zoom 16
      map.flyTo({ zoom: 16 });
    } else {
      // setting the same view still triggers the moveend event
      map.jumpTo({ zoom: currentZoom, center: map.getCenter() });
    }
  }

  const fetchData = async () => {
    const { category, query } = poiFilters;
    // @TODO: put bbox => string in a dedicated lib
    const bbox = getVisibleBbox(window.map.mb);
    const urlBBox = [bbox.getWest(), bbox.getSouth(), bbox.getEast(), bbox.getNorth()]
      .map(cardinal => cardinal.toFixed(7))
      .join(',');

    const { places, source } = await IdunnPoi.poiCategoryLoad(
      urlBBox,
      MAX_PLACES,
      category,
      query
    );

    setPois(places);
    setDataSource(source);
    setInitialLoading(false);

    fire('add_category_markers', places, poiFilters);
    fire('save_location');
  };

  return <Panel
    resizable
    title={<CategoryPanelHeader dataSource={dataSource} loading={initialLoading} />}
    minimizedTitle={_('Show results', 'categories')}
    close={() => { window.app.navigateTo('/'); }}
    className="category__panel"
  >
    {initialLoading
      ? <PoiItemListPlaceholder />
      : <Result pois={pois} poiFilters={poiFilters} />}
  </Panel>;
};

CategoryPanel.propTypes = {
  poiFilters: PropTypes.object,
  bbox: PropTypes.string,
};

export default CategoryPanel;
