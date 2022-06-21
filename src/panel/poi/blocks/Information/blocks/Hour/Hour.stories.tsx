import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { poiHourBlockMock } from './mock';

import PoiHourBlock from '.';

export default {
  title: 'Components/Poi/Blocks/Information/Hour',
  component: PoiHourBlock,
} as ComponentMeta<typeof PoiHourBlock>;

export const Default: ComponentStory<typeof PoiHourBlock> = args => <PoiHourBlock {...args} />;
Default.args = {
  ...poiHourBlockMock,
};
