import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import VehicleIcon from './';

export default {
  title: 'Panels/Direction/VehicleIcon',
  component: VehicleIcon,
} as ComponentMeta<typeof VehicleIcon>;

export const PublicTransport: ComponentStory<typeof VehicleIcon> = () => (
  <VehicleIcon vehicle="publicTransport" />
);
export const Driving: ComponentStory<typeof VehicleIcon> = () => <VehicleIcon vehicle="driving" />;
export const Cycling: ComponentStory<typeof VehicleIcon> = () => <VehicleIcon vehicle="cycling" />;
export const Walking: ComponentStory<typeof VehicleIcon> = () => <VehicleIcon vehicle="walking" />;
