/* global _ */
import React from 'react';
import Panel from 'src/components/ui/Panel';
import nconf from '@qwant/nconf-getter';
import Telemetry from "../libs/telemetry";

class EventListPanel extends React.Component {

  close = () => {
    Telemetry.add(Telemetry.FAVORITE_CLOSE);
    window.app.navigateTo('/');
  };

  render() {
    return <Panel
      resizable
      title='Hi'
      minimizedTitle='Hi'
      className='events_list'
      close={this.close}>
      <h1>Hi</h1>
    </Panel>;
  }
}

export default EventListPanel;