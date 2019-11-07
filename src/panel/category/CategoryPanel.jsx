/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import Panel from 'src/components/ui/Panel';
import PoiCategoryItemList from './PoiCategoryItemList';
import CategoryPanelError from './CategoryPanelError';
import CategoryPanelHeader from './CategoryPanelHeader';
import Telemetry from 'src/libs/telemetry';
import SearchInput from 'src/ui_components/search_input';
import debounce from 'src/libs/debounce';
import nconf from '@qwant/nconf-getter';
import IdunnPoi from 'src/adapters/poi/idunn_poi';

const categoryConfig = nconf.get().category;
const MAX_PLACES = Number(categoryConfig.maxPlaces);

export default class CategoryPanel extends React.Component {
  static propTypes = {
    categoryName: PropTypes.string.isRequired,
    pois: PropTypes.array.isRequired,
    dataSource: PropTypes.string.isRequired,
    hasError: PropTypes.bool,
    zoomIn: PropTypes.bool,
  }

  componentDidMount() {
    listen('map_moveend', this.fetchData);
  }

  componentDidUpdate() {
    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
      panelContent.scrollTop = 0;
    }
  }

  componentWillUnmount() {
    window.unListen('map_moveend', this.fetchData);
  }

  fetchData = debounce(async () => {
    this.loading = true;
    const bbox = window.map.mb.getBounds();
    const urlBBox = [bbox.getWest(), bbox.getSouth(), bbox.getEast(), bbox.getNorth()]
      .map(cardinal => cardinal.toFixed(7))
      .join(',');

    const { places, source } = await IdunnPoi.poiCategoryLoad(
      urlBBox,
      MAX_PLACES,
      this.categoryName,
      this.query
    );
    this.pois = places;
    this.dataSource = source;
    this.loading = false;

    fire('add_category_markers', this.pois);
    fire('save_location');
  });

  onShowPhoneNumber = poi => {
    if (poi.meta && poi.meta.source) {
      Telemetry.add('phone', 'poi', poi.meta.source,
        Telemetry.buildInteractionData({
          id: poi.id,
          source: poi.meta.source,
          template: 'multiple',
          zone: 'list',
          element: 'phone',
          category: this.props.categoryName,
        })
      );
    }
  }

  close = () => {
    SearchInput.setInputValue('');
    window.app.navigateTo('/');
  }

  selectPoi = poi => {
    fire('click_category_poi', poi, this.props.categoryName);
  }

  highlightPoiMarker = (poi, highlight) => {
    fire('highlight_category_marker', poi, highlight);
  }

  render() {
    const { pois, dataSource, hasError, zoomIn } = this.props;
    let panelContent;

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

    return <Panel
      resizable
      title={<CategoryPanelHeader dataSource={dataSource} />}
      minimizedTitle={_('Show results', 'categories')}
      close={this.close}
      className="category__panel"
    >
      {panelContent}
    </Panel>;
  }
}
