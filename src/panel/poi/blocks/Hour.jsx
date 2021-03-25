/* globals _ */
import React from 'react';
import OsmSchedule from 'src/adapters/osm_schedule';
import TimeTable from './TimeTable';
import PropTypes from 'prop-types';

import Block from 'src/panel/poi/blocks/Block';

const HourBlock = ({ block, covid19enabled }) => {
  const schedule = new OsmSchedule(block);
  if (!schedule.days) {
    return null;
  }

  return (
    <Block icon="icon_clock" title={_('opening hours')}>
      <TimeTable
        schedule={schedule}
        title={covid19enabled && _('See the usual opening hours', 'covid19')}
      />
    </Block>
  );
};

HourBlock.propTypes = {
  block: PropTypes.object,
  covid19enabled: PropTypes.bool,
};

export default HourBlock;
