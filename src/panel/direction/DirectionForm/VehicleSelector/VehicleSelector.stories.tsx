import React, { useState } from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import VehicleSelector from './';

export default {
  title: 'Components/Direction/VehicleSelector',
  component: VehicleSelector,
  decorators: [
    Story => (
      <div style={{ backgroundColor: 'var(--green-400)', padding: '1rem' }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof VehicleSelector>;

export const Default: ComponentStory<typeof VehicleSelector> = () => {
  const [activeVehicle, setActiveVehicle] = useState('');
  return (
    <VehicleSelector
      vehicles={['driving', 'publicTransport', 'walking', 'cycling']}
      activeVehicle={activeVehicle}
      onSelectVehicle={vehicle => setActiveVehicle(vehicle)}
      texts={{
        driving: 'Voiture',
        publicTransport: 'Transport',
        walking: 'À pied',
        cycling: 'À vélo',
      }}
    />
  );
};
