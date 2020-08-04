/* globals _ */
import React from 'react';
import OsmSchedule from 'src/adapters/osm_schedule';
import TimeTable from './TimeTable';
import PropTypes from 'prop-types';

import Block from 'src/panel/poi/blocks/Block';

export default class HourBlock extends React.Component {
  static propTypes = {
    block: PropTypes.object,
    covid19enabled: PropTypes.bool,
  }

  render() {
    const schedule = new OsmSchedule(this.props.block);
    if (!schedule.days) {
      return null;
    }

    return <Block icon="icon_clock" title={_('opening hours')}>
      <TimeTable
        schedule={schedule}
        title={this.props.covid19enabled && _('See the usual opening hours', 'covid19')}
      />
    </Block>;
  }
}
