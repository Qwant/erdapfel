import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { poiWebsiteBlockMock } from './mock';

import PoiWebsiteBlock from '.';

export default {
  title: 'Components/Poi/Blocks/Information/Website',
  component: PoiWebsiteBlock,
} as ComponentMeta<typeof PoiWebsiteBlock>;

export const Default: ComponentStory<typeof PoiWebsiteBlock> = args => (
  <PoiWebsiteBlock {...args} />
);
Default.args = {
  ...poiWebsiteBlockMock,
};
