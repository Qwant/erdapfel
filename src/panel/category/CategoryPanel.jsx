/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import Panel from 'src/components/ui/Panel';
import PoiCategoryItemList from './PoiCategoryItemList';
import CategoryPanelError from './CategoryPanelError';
import CategoryPanelHeader from './CategoryPanelHeader';
import Telemetry from 'src/libs/telemetry';

export default class CategoryPanel extends React.Component {
  static propTypes = {
    categoryName: PropTypes.string.isRequired,
    pois: PropTypes.array.isRequired,
    dataSource: PropTypes.string.isRequired,
    hasError: PropTypes.bool,
    zoomIn: PropTypes.bool,
    close: PropTypes.func.isRequired,
    selectPoi: PropTypes.func.isRequired,
    highlightPoiMarker: PropTypes.func.isRequired,
  }

  componentDidUpdate() {
    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
      panelContent.scrollTop = 0;
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
    const { pois, dataSource, hasError, zoomIn, close, selectPoi, highlightPoiMarker } = this.props;
    let panelContent;

    if (hasError) {
      panelContent = <CategoryPanelError zoomIn={zoomIn} />;
    } else {
      panelContent = <PoiCategoryItemList
        pois={pois}
        selectPoi={selectPoi}
        highlightMarker={highlightPoiMarker}
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
