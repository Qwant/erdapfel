/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import Panel from 'src/components/ui/Panel';
import PoiCategoryItemList from './PoiCategoryItemList';
import PoiItemListPlaceholder from './PoiItemListPlaceholder';
import CategoryPanelError from './CategoryPanelError';
import CategoryPanelHeader from './CategoryPanelHeader';
import Telemetry from 'src/libs/telemetry';
import SearchInput from 'src/ui_components/search_input';
import nconf from '@qwant/nconf-getter';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import CategoryService from 'src/adapters/category_service';

const categoryConfig = nconf.get().category;
const MAX_PLACES = Number(categoryConfig.maxPlaces);

export default class CategoryPanel extends React.Component {
  static propTypes = {
    poiFilters: PropTypes.object,
    bbox: PropTypes.string,
  }

  static defaultProps = {
    poiFilters: {},
  }

  state = {
    pois: [],
    dataSource: '',
    initialLoading: true,
  }

  componentDidMount() {
    const { category } = this.props.poiFilters;
    this.mapMoveHandler = listen('map_moveend', this.fetchData);

    if (category) {
      Telemetry.add(Telemetry.POI_CATEGORY_OPEN, null, null, { category });
      const { label } = CategoryService.getCategoryByName(category);
      SearchInput.setInputValue(label.charAt(0).toUpperCase() + label.slice(1));
    }

    window.execOnMapLoaded(() => { this.fitMapAndFetch(); });
  }

  componentDidUpdate(prevProps) {
    const { bbox, poiFilters } = this.props;

    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
      panelContent.scrollTop = 0;
    }

    // Check for a new, or changed poiFilter
    for (const key in poiFilters) {
      if (poiFilters[key] !== prevProps.poiFilters[key]) {
        this.fetchData();
        break;
      }
    }

    if (bbox && bbox !== prevProps.bbox) {
      window.execOnMapLoaded(() => { this.fitMapAndFetch(); });
    }
  }

  componentWillUnmount() {
    window.unListen(this.mapMoveHandler);
  }

  fitMapAndFetch() {
    const rawBbox = (this.props.bbox || '').split(',');
    const bbox = rawBbox.length === 4 && [[rawBbox[0], rawBbox[1]], [rawBbox[2], rawBbox[3]]];
    if (bbox) {
      window.map.mb.fitBounds(bbox, { animate: false });
    }

    if (window.map.mb.isMoving()) {
      /*
        Do not trigger API search and zoom change when the map
        is already moving, to avoid flickering.
        The search will be triggered on moveend.
      */
      return;
    }

    // Apply correct zoom when opening a category
    const currentZoom = window.map.mb.getZoom();

    // Zoom < 5: focus on Paris
    if (currentZoom < 5) {
      window.map.mb.flyTo({ center: [2.35, 48.85], zoom: 12 });
    } else if (currentZoom < 12) { // Zoom < 12: zoom up to zoom 12
      window.map.mb.flyTo({ zoom: 12 });
    } else if (currentZoom > 16) { // Zoom > 16: dezoom to zoom 16
      window.map.mb.flyTo({ zoom: 16 });
    } else {
      this.fetchData();
    }
  }

  fetchData = async () => {
    const { category, query } = this.props.poiFilters;

    const bbox = window.map.mb.getBounds();
    const urlBBox = [bbox.getWest(), bbox.getSouth(), bbox.getEast(), bbox.getNorth()]
      .map(cardinal => cardinal.toFixed(7))
      .join(',');

    const { places, source } = await IdunnPoi.poiCategoryLoad(
      urlBBox,
      MAX_PLACES,
      category,
      query
    );

    this.setState({
      pois: places,
      dataSource: source,
      initialLoading: false,
    });

    fire('add_category_markers', places, this.props.poiFilters);
    fire('save_location');
  };

  onShowPhoneNumber = poi => {
    if (poi.meta && poi.meta.source) {
      Telemetry.add('phone', 'poi', poi.meta.source,
        Telemetry.buildInteractionData({
          id: poi.id,
          source: poi.meta.source,
          template: 'multiple',
          zone: 'list',
          element: 'phone',
          category: this.props.poiFilters.category,
        })
      );
    }
  }

  close = () => {
    SearchInput.setInputValue('');
    window.app.navigateTo('/');
  }

  selectPoi = poi => {
    const { poiFilters } = this.props;
    fire('click_category_poi', poi, poiFilters);
  }

  highlightPoiMarker = (poi, highlight) => {
    fire('highlight_category_marker', poi, highlight);
  }

  render() {
    const { initialLoading, pois, dataSource } = this.state;

    let panelContent;

    if (initialLoading) {
      panelContent = <PoiItemListPlaceholder />;
    } else {
      const hasError = !pois || pois.length === 0;
      const zoomIn = !pois;

      if (hasError) {
        panelContent = <CategoryPanelError zoomIn={zoomIn} />;
      } else {
        panelContent = <PoiCategoryItemList
          pois={pois}
          selectPoi={this.selectPoi}
          highlightMarker={this.highlightPoiMarker}
          onShowPhoneNumber={this.onShowPhoneNumber}
        />;
      }
    }

    return <Panel
      resizable
      title={<CategoryPanelHeader dataSource={dataSource} loading={initialLoading} />}
      minimizedTitle={_('Show results', 'categories')}
      close={this.close}
      className="category__panel"
    >
      {panelContent}
    </Panel>;
  }
}
