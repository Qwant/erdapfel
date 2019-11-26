// /* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import Panel from 'src/components/ui/Panel';
import PoiEventItemList from './PoiEventItemList';
import EventPanelError from './EventPanelError';
// import EventPanelHeader from './EventPanelHeader';
import Telemetry from 'src/libs/telemetry';
import SearchInput from 'src/ui_components/search_input';
import nconf from '@qwant/nconf-getter';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import events from 'config/events.yml';
// import CategoryPanelError from '../category/CategoryPanelError';
// import PoiCategoryItemList from '../category/PoiCategoryItemList';

const eventConfig = nconf.get().events;
const MAX_PLACES = Number(eventConfig.maxPlaces);

class EventListPanel extends React.Component {

  static propTypes = {
    eventName: PropTypes.string,
    query: PropTypes.string,
    bbox: PropTypes.string,
  };

  state = {
    pois: [],
    dataSource: '',
    initialLoading: true,
  };

  componentDidMount() {
    this.mapMoveHandler = listen('map_moveend', this.fetchData);

    if (this.props.eventName) {
      Telemetry.add(Telemetry.POI_EVENT_OPEN, null, null, { category: this.props.eventName });
      const { label } = events.find(ev => ev.name === this.props.eventName);
      SearchInput.setInputValue(label.charAt(0).toUpperCase() + label.slice(1));
    }
    this.fitMapAndFetch();
  }

  componentDidUpdate() {
    const panelContent = document.querySelector('.panel-content');
    if (panelContent) {
      panelContent.scrollTop = 0;
    }
  }

  componentWillUnmount() {
    window.unListen(this.mapMoveHandler);
  }

  fitMapAndFetch() {
    const rawBbox = (this.props.bbox || '').split(',');
    const bbox = rawBbox.length === 4 && [[rawBbox[0], rawBbox[1]], [rawBbox[2], rawBbox[3]]];
    if (bbox) {
      window.execOnMapLoaded(() => {
        window.map.mb.fitBounds(bbox, { animate: false });
      });
    }

    if (window.map.mb.isMoving()) {
      /*
        Do not trigger API search and zoom change when the map
        is already moving, to avoid flickering.
        The search will be triggered on moveend.
      */
      return;
    }

    // Apply correct zoom when opening an event
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
    const bbox = window.map.mb.getBounds();
    const urlBBox = [bbox.getWest(), bbox.getSouth(), bbox.getEast(), bbox.getNorth()]
      .map(cardinal => cardinal.toFixed(7))
      .join(',');
    const { events } = await IdunnPoi.poiEventLoad(
      urlBBox,
      MAX_PLACES,
      this.props.eventName,
      this.props.query
    );
    this.setState({
      pois: events,
      initialLoading: false,
    });
    fire('add_category_markers', events, this.props.eventName);
    fire('save_location');
  }

  selectPoi = poi => {
    fire('click_category_poi', poi, this.props.eventName);
  }

  highlightPoiMarker = (poi, highlight) => {
    fire('highlight_category_marker', poi, highlight);
  }

  close = () => {
    window.app.navigateTo('/');
  }

  render() {

    const { initialLoading, pois } = this.state;

    if (initialLoading) {
      return null;
    }

    const hasError = !pois || pois.length === 0;

    const zoomIn = !pois;

    let panelContent;

    if (hasError) {
      panelContent = <EventPanelError zoomIn={zoomIn} />;
    } else {
      panelContent = <PoiEventItemList
        pois={pois}
        selectPoi={this.selectPoi}
        highlightMarker={this.highlightPoiMarker}
        eventName={this.props.eventName.charAt(0).toUpperCase() + this.props.eventName.slice(1)}
      />;
    }

    return <Panel
      resizable
      title=""
      minimizedTitle=""
      className="events_list"
      close={this.close}>
      {panelContent}
    </Panel>;
  }
}

export default EventListPanel;
