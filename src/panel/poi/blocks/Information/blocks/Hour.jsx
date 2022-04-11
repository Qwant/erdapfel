import React from 'react';
import OsmSchedule from 'src/adapters/osm_schedule';
import TimeTable from './TimeTable';
import PropTypes from 'prop-types';
import { useI18n } from 'src/hooks';
import Block from 'src/panel/poi/blocks/Block';
import { IconTime } from '@qwant/qwant-ponents';
import { ACTION_BLUE_BASE } from 'src/libs/colors';

const HourBlock = ({ block, covid19enabled }) => {
  const { _ } = useI18n();

  const schedule = new OsmSchedule(block);
  if (!schedule.days) {
    return null;
  }

  return (
    <Block icon={<IconTime size={20} fill={ACTION_BLUE_BASE} />} title={_('opening hours')}>
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
