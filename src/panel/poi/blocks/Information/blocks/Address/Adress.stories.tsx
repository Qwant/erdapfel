import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { poiAddressBlockMock } from './mock';

import PoiAddressBlock from './';

export default {
  title: 'Components/Poi/Blocks/Information/Address',
  component: PoiAddressBlock,
} as ComponentMeta<typeof PoiAddressBlock>;

export const Default: ComponentStory<typeof PoiAddressBlock> = args => (
  <PoiAddressBlock {...args} />
);
Default.args = {
  ...poiAddressBlockMock,
};
