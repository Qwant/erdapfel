import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import VehicleSelectorButton from './';

export default {
  title: 'Components/Direction/VehicleSelectorButton',
  component: VehicleSelectorButton,
  decorators: [
    Story => (
      <div style={{ backgroundColor: 'var(--green-400)', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof VehicleSelectorButton>;

export const Default: ComponentStory<typeof VehicleSelectorButton> = () => (
  <VehicleSelectorButton
    vehicle="cycling"
    isActive={false}
    // eslint-disable-next-line no-console
    onClick={vehicle => console.log(`Just click on ${vehicle}`)}
  />
);

export const Activated: ComponentStory<typeof VehicleSelectorButton> = () => (
  <VehicleSelectorButton
    vehicle="publicTransport"
    isActive={true} // eslint-disable-next-line no-console
    onClick={vehicle => console.log(`Just click on ${vehicle}`)}
  />
);
