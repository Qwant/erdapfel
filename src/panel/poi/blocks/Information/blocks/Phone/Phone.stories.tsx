import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { poiPhoneBlockMockHidden, poiPhoneBlockMockVisible } from './mock';

import PoiPhoneBlock from '.';

export default {
  title: 'Components/Poi/Blocks/Information/Phone',
  component: PoiPhoneBlock,
} as ComponentMeta<typeof PoiPhoneBlock>;

export const VisibleByDefault: ComponentStory<typeof PoiPhoneBlock> = args => (
  <PoiPhoneBlock {...args} />
);
VisibleByDefault.args = {
  ...poiPhoneBlockMockVisible,
};

export const HiddenByDefault: ComponentStory<typeof PoiPhoneBlock> = args => (
  <PoiPhoneBlock {...args} />
);
HiddenByDefault.args = {
  ...poiPhoneBlockMockHidden,
};
