/* global _ */
import React from 'react';
import Panel from 'src/components/ui/Panel';
import nconf from '@qwant/nconf-getter';

class EventListPanel extends React.Component {
  render() {
    return <Panel resizable title='Hi' minimizedTitle='Hi' className='events_list'>
      <h1>Hi</h1>
    </Panel>;
  }
}

export default EventListPanel;