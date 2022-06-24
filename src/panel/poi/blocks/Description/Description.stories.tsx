import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import { poiDescriptionBlockMock } from './mock';

import PoiDescriptionBlock from './';

export default {
  title: 'Components/Poi/Blocks/Description',
  component: PoiDescriptionBlock,
} as ComponentMeta<typeof PoiDescriptionBlock>;

export const SourceWikipedia: ComponentStory<typeof PoiDescriptionBlock> = args => (
  <PoiDescriptionBlock {...args} />
);
SourceWikipedia.args = poiDescriptionBlockMock;

export const SourcePagesJaunes: ComponentStory<typeof PoiDescriptionBlock> = args => (
  <PoiDescriptionBlock {...args} />
);
SourcePagesJaunes.args = {
  ...poiDescriptionBlockMock,
  block: {
    ...poiDescriptionBlockMock.block,
    source: 'pagesjaunes',
  },
};

export const SourceOther: ComponentStory<typeof PoiDescriptionBlock> = args => (
  <PoiDescriptionBlock {...args} />
);
SourceOther.args = {
  ...poiDescriptionBlockMock,
  block: {
    ...poiDescriptionBlockMock.block,
    source: 'osm',
  },
};
