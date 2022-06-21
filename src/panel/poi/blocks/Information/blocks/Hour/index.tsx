import React from 'react';
import TimeTable from './TimeTable';
import Block from 'src/panel/poi/blocks/Block';
import { IconTime } from '@qwant/qwant-ponents';
import { ACTION_BLUE_BASE } from 'src/libs/colors';

export type PoiHourBlockProps = {
  schedule?: any; // TODO: OsmSchedule type
  texts?: {
    open_24_7: string;
    opening_hours: string;
    open: string;
    closed: string;
    reopening: string;
    until: string;
  };
};

const HourBlock: React.FunctionComponent<PoiHourBlockProps> = ({ schedule, texts }) => {
  if (!schedule?.days) {
    return null;
  }

  return (
    <Block icon={<IconTime size={20} fill={ACTION_BLUE_BASE} />} title={texts?.opening_hours}>
      <TimeTable schedule={schedule} texts={texts} />
    </Block>
  );
};

export default HourBlock;
