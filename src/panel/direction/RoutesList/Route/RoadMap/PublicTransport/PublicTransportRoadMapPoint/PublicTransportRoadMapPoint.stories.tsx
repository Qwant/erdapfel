import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import PublicTransportRoadMapPoint from './';

export default {
  title: 'Components/Direction/PublicTransportRoadMapPoint',
  component: PublicTransportRoadMapPoint,
} as ComponentMeta<typeof PublicTransportRoadMapPoint>;

export const Default: ComponentStory<typeof PublicTransportRoadMapPoint> = () => (
  <PublicTransportRoadMapPoint
    title="Palais Garnier"
    details={
      <div>
        <span>Rue du Test</span>
        <span>75001</span>
        <span>Paris</span>
      </div>
    }
  />
);
