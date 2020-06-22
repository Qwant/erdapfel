/* global _ */
import React from 'react';
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
import { boundsFromFlatArray, parseBboxString, boundsToString } from 'src/libs/bounds';

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
    this.updateSearchBarContent();
    this.mapMoveHandler = listen('map_moveend', this.fetchData);
    window.execOnMapLoaded(() => { this.fitMap(); });
  }

  componentDidUpdate(prevProps) {
    this.updateSearchBarContent(prevProps);

    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
      panelContent.scrollTop = 0;
    }

    if (JSON.stringify(prevProps.poiFilters) !== JSON.stringify(this.props.poiFilters)
     || prevProps.bbox !== this.props.bbox) {
      this.setState({ initialLoading: true }, () => {
        window.execOnMapLoaded(() => { this.fitMap(); });
      });
    }
  }

  updateSearchBarContent(prevProps) {
    const { category, query } = this.props.poiFilters;
    if (category) {
      if (category !== prevProps?.poiFilters?.category) {
        Telemetry.add(Telemetry.POI_CATEGORY_OPEN, null, null, { category });
      }
      const { label } = CategoryService.getCategoryByName(category);
      SearchInput.setInputValue(capitalizeFirst(label));
    } else if (query) {
      SearchInput.setInputValue(query);
    }
  }

  componentWillUnmount() {
    SearchInput.setInputValue('');
    unListen(this.mapMoveHandler);
  }

  fitMap() {
    if (this.props.bbox) {
      window.map.mb.fitBounds(parseBboxString(this.props.bbox), { animate: false });
      return;
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
    } else {
      // setting the same view still triggers the moveend event
      window.map.mb.jumpTo({ zoom: currentZoom, center: window.map.mb.getCenter() });
    }
  }

  fetchData = async () => {
    const { category, query } = this.props.poiFilters;
    const currentBounds = getVisibleBbox(window.map.mb);

    const extendBBox = this.state.initialLoading;
    const { places, source, bbox: contentBBox, bbox_extended } = await IdunnPoi.poiCategoryLoad(
      boundsToString(currentBounds),
      MAX_PLACES,
      category,
      query,
      extendBBox
    );

    this.setState({
      pois: places,
      dataSource: source,
      initialLoading: false,
    });

    if (bbox_extended) {
      // The returned bbox is sure to contain at least one POI.
      // Extend the current one to include it.
      window.map.mb.fitBounds(currentBounds.extend(boundsFromFlatArray(contentBBox)));
    }

    fire('add_category_markers', places, this.props.poiFilters);
    fire('save_location');
  };

  close = () => {
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
        panelContent = <PoiItemList
          pois={pois}
          selectPoi={this.selectPoi}
          highlightMarker={this.highlightPoiMarker}
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
