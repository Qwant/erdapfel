/* global _ */
import React from 'react';
import classnames from 'classnames';
import VehicleSelectorButton from './VehicleSelectorButton';

const VehicleSelector = ({ vehicles, activeVehicle, onSelectVehicle }) => (
  <div
    className={classnames('vehicleSelector', {
      'vehicleSelector--withPublicTransport': vehicles.length > 3,
    })}
    role="radiogroup"
  >
    {vehicles.map(vehicle => (
      <VehicleSelectorButton
        key={vehicle}
        vehicle={vehicle}
        isActive={vehicle === activeVehicle}
        onClick={() => onSelectVehicle(vehicle)}
        texts={{
          driving: _('by car', 'direction'),
          publicTransport: _('transit', 'direction'),
          walking: _('on foot', 'direction'),
          cycling: _('by bike', 'direction'),
        }}
      />
    ))}
  </div>
);

export default VehicleSelector;
