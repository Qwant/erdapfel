import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { poiAddressBlockMock } from './blocks/Address/mock';
import { poiContactBlockMock } from './blocks/Contact/mock';
import { poiHourBlockMock } from './blocks/Hour/mock';
import { poiPhoneBlockMockVisible } from './blocks/Phone/mock';
import { poiWebsiteBlockMock } from './blocks/Website/mock';
import { poiSocialNetworksBlockMock } from './blocks/SocialNetworks/mock';

import PoiInformationBlock from '.';

export default {
  title: 'Components/Poi/Blocks/Information',
  component: PoiInformationBlock,
} as ComponentMeta<typeof PoiInformationBlock>;

export const Default: ComponentStory<typeof PoiInformationBlock> = args => (
  <PoiInformationBlock {...args} />
);
Default.args = {
  title: 'Hello world',
  addressBlock: poiAddressBlockMock,
  hourBlock: poiHourBlockMock,
  phoneBlock: poiPhoneBlockMockVisible,
  websiteBlock: poiWebsiteBlockMock,
  contactBlock: poiContactBlockMock,
  socialBlock: poiSocialNetworksBlockMock,
};
