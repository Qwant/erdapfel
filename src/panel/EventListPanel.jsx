/* global _ */
import React from 'react';
import Panel from 'src/components/ui/Panel';
import PropTypes from 'prop-types';
import nconf from '@qwant/nconf-getter';
import Telemetry from "../libs/telemetry";
import events from '../../config/events.yml';
import IdunnPoi from "../adapters/poi/idunn_poi";

const eventConfig = nconf.get().events;
const MAX_PLACES = Number(eventConfig.maxPlaces);

class EventListPanel extends React.Component {

  static propTypes = {
    type: PropTypes.string.isRequired,
  }

  close = () => {
    window.app.navigateTo('/');
  }


  /*async search() {
    this.loading = true;
    const bbox = window.map.mb.getBounds();
    const urlBBox = [bbox.getWest(), bbox.getSouth(), bbox.getEast(), bbox.getNorth()]
      .map(cardinal => cardinal.toFixed(7))
      .join(',');

    const { places, source } = await IdunnPoi.poiEventLoad(
      urlBBox,
      MAX_PLACES,
      this.categoryName,
      this.query
    );
    this.pois = places;
    this.dataSource = source;
    this.loading = false;

    this.renderPanel();

    this.addCategoryMarkers();
    fire('save_location');
  }*/



  render() {
    return <Panel
      resizable
      title='Hi'
      minimizedTitle='Hi'
      className='events_list'
      close={this.close}>
      <h1>{this.props.type}</h1>
    </Panel>;
  }
}

export default EventListPanel;


/*
Data: https://maps.dev.qwant.ninja/maps/detail/v1/events?bbox=2,48,3,49&category=exhibition
categories: concert / show / exhibition / sport / entertainment
 */