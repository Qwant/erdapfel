import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { poiSocialNetworksBlockMock } from './mock';

import PoiSocialNetworksBlock from '.';

export default {
  title: 'Components/Poi/Blocks/Information/SocialNetworks',
  component: PoiSocialNetworksBlock,
} as ComponentMeta<typeof PoiSocialNetworksBlock>;

export const Default: ComponentStory<typeof PoiSocialNetworksBlock> = args => (
  <PoiSocialNetworksBlock {...args} />
);
Default.args = {
  ...poiSocialNetworksBlockMock,
};
