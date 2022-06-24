import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { poiRecyclingBlockMock } from './mock';

import PoiRecyclingBlock from '.';

export default {
  title: 'Components/Poi/Blocks/Information/Recycling',
  component: PoiRecyclingBlock,
} as ComponentMeta<typeof PoiRecyclingBlock>;

export const Default: ComponentStory<typeof PoiRecyclingBlock> = args => (
  <PoiRecyclingBlock {...args} />
);
Default.args = {
  ...poiRecyclingBlockMock,
};
