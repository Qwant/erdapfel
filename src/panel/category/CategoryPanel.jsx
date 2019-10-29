/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import Panel from 'src/components/ui/Panel';
import PoiCategoryItemList from './PoiCategoryItemList';
import CategoryPanelError from './CategoryPanelError';
import CategoryPanelHeader from './CategoryPanelHeader';
import layouts from 'src/panel/layouts.js';
import Telemetry from 'src/libs/telemetry';

export default class CategoryPanel extends React.Component {
  static propTypes = {
    categoryName: PropTypes.string.isRequired,
    pois: PropTypes.array.isRequired,
    dataSource: PropTypes.string.isRequired,
    hasError: PropTypes.bool,
    zoomIn: PropTypes.bool,
    close: PropTypes.func.isRequired,
  }

  componentDidUpdate() {
    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
      panelContent.scrollTop = 0;
    }
  }

  selectPoi = poi => {
    const previousMarker = document.querySelector('.mapboxgl-marker.active');
    if (previousMarker) {
      previousMarker.classList.remove('active');
    }
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
    window.app.navigateTo(`/place/${poi.toUrl()}`, {
      poi: poi.serialize(),
      isFromCategory: true,
      sourceCategory: this.props.categoryName,
      layout: layouts.LIST,
      centerMap: true,
    });
    this.highlightPoiMarker(poi, true);
  }

  highlightPoiMarker = (poi, highlight) => {
    const marker = document.getElementById(poi.marker_id);
    if (marker) {
      if (highlight) {
        marker.classList.add('active');
      } else {
        marker.classList.remove('active');
      }
    }
  }

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

  render() {
    const { pois, dataSource, hasError, zoomIn, close } = this.props;
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
      close={close}
      className="category__panel"
    >
      {panelContent}
    </Panel>;
  }
}
