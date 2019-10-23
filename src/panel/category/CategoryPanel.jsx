/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import Panel from 'src/components/ui/Panel';
import PoiCategoryItems from './PoiCategoryItems';
import debounce from 'src/libs/debounce';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import nconf from '@qwant/nconf-getter';
import Telemetry from 'src/libs/telemetry';
import CategoryService from 'src/adapters/category_service';
import SearchInput from 'src/ui_components/search_input';
import layouts from 'src/panel/layouts.js';

const MAX_PLACES = Number(nconf.get().category.maxPlaces);

export default class CategoryPanel extends React.Component {
  static propTypes = {
    categoryName: PropTypes.string.isRequired,
    query: PropTypes.string,
    bbox: PropTypes.string,
  }

  static defaultProps = {
    query: '',
    bbox: '',
  }

  state = {
    pois: [],
    dataSource: null,
    isLoading: true,
  }

  componentDidMount() {
    const { name, label } = CategoryService.getCategoryByName(this.props.categoryName);
    Telemetry.add(Telemetry.POI_CATEGORY_OPEN, null, null, { category: name });
    SearchInput.setInputValue(label.charAt(0).toUpperCase() + label.slice(1));

    this.fitMap();
    this.clickHandler = listen('click_category_poi', this.selectPoi);
    this.mapMoveHandler = listen('map_moveend', debounce(this.refresh, 300));
  }

  componentWillUnmount() {
    SearchInput.setInputValue('');
    fire('remove_category_markers');
    unListen(this.clickHandler);
    unListen(this.mapMoveHandler);
  }

  fitMap() {
    const map = window.map.mb;

    const rawBbox = this.props.bbox.split(',');
    if (rawBbox.length === 4) {
      const bbox = [[rawBbox[0], rawBbox[1]], [rawBbox[2], rawBbox[3]]];
      window.execOnMapLoaded(() => { map.fitBounds(bbox, { animate: false }); });
    }

    if (map.isMoving()) {
      // Do not trigger API search and zoom change when the map is already moving,
      // to avoid flickering. The search will be triggered on moveend.
      return;
    }

    // Apply correct zoom when opening a category
    const currentZoom = map.getZoom();

    if (currentZoom < 5) { // Zoom < 5: focus on Paris
      map.flyTo({ center: [2.35, 48.85], zoom: 12 });
    } else if (currentZoom < 12) { // Zoom < 12: zoom up to zoom 12
      map.flyTo({ zoom: 12 });
    } else if (currentZoom > 16) { // Zoom > 16: dezoom to zoom 16
      map.flyTo({ zoom: 16 });
    } else {
      this.refresh();
    }
  }

  refresh = async () => {
    this.setState({ isLoading: true });

    const bbox = window.map.bbox();
    const urlBBox = [bbox.getWest(), bbox.getSouth(), bbox.getEast(), bbox.getNorth()]
      .map(cardinal => cardinal.toFixed(7))
      .join(',');

    const { places, source } = await IdunnPoi.poiCategoryLoad(
      urlBBox,
      MAX_PLACES,
      this.props.categoryName,
      this.props.query
    );

    this.setState({
      isLoading: false,
      pois: places,
      dataSource: source,
    });

    fire('add_category_markers', this.state.pois);
    fire('save_location');
  };

  close = () => {
    window.app.navigateTo('/');
  };

  geoloc = () => {
    document.querySelector('.mapboxgl-ctrl-geolocate').click();
  }

  selectPoi = poi => {
    if (poi.meta && poi.meta.source) {
      Telemetry.add('open', 'poi', poi.meta.source,
        Telemetry.buildInteractionData({
          id: poi.id,
          source: poi.meta.source,
          template: 'multiple',
          zone: 'list',
          element: 'item',
          category: this.props.categoryName,
        })
      );
    }
    this.highlightMarker(poi, true);
    window.app.navigateTo(`/place/${poi.toUrl()}`, {
      poi: poi.serialize(),
      isFromCategory: true,
      sourceCategory: this.props.categoryName,
      layout: layouts.LIST,
      centerMap: true,
    });
  }

  highlightMarker = (poi, highlight) => {
    const marker = document.getElementById(poi.marker_id);
    if (marker) {
      if (highlight) {
        marker.classList.add('active');
      } else {
        marker.classList.remove('active');
      }
    }
  }

  render() {
    if (this.state.isLoading && this.state.pois.length === 0) {
      return null;
    }

    return <Panel resizable
      minimizedTitle={_('Show results', 'categories')}
      close={this.close}
      className="category__panel"
    >
      <PoiCategoryItems
        pois={this.state.pois}
        selectPoi={this.selectPoi}
        highlightMarker={this.highlightMarker}
      />
    </Panel>;
  }
}
