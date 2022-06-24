import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { poiContactBlockMock } from './mock';

import PoiContactBlock from '.';

export default {
  title: 'Components/Poi/Blocks/Information/Contact',
  component: PoiContactBlock,
} as ComponentMeta<typeof PoiContactBlock>;

export const Default: ComponentStory<typeof PoiContactBlock> = args => (
  <PoiContactBlock {...args} />
);
Default.args = {
  ...poiContactBlockMock,
};
