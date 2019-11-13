/* global _ */
import React from 'react';
import Panel from 'src/components/ui/Panel';
import PropTypes from 'prop-types';
import nconf from '@qwant/nconf-getter';
import Telemetry from "../libs/telemetry";
import events from '../../config/events.yml';

class EventListPanel extends React.Component {

  static propTypes = {
    type: PropTypes.string.isRequired,
  }

  close = () => {
    window.app.navigateTo('/');
  }

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
