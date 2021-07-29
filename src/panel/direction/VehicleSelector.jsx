/* global _ */
import React from 'react';
import classnames from 'classnames';
import { capitalizeFirst } from 'src/libs/string';
import VehicleIcon from './VehicleIcon';
import { useDevice } from 'src/hooks';

const VehicleSelectorButton = ({ vehicle, isActive, onClick }) => {
  const { isMobile } = useDevice();

  const vehicleLabels = {
    driving: _('by car', 'direction'),
    publicTransport: _('transit', 'direction'),
    walking: _('on foot', 'direction'),
    cycling: _('by bike', 'direction'),
  };

  const label = capitalizeFirst(vehicleLabels[vehicle]);
  return (
    <button
      type="button"
      className={classnames('vehicleSelector-button', `vehicleSelector-button--${vehicle}`, {
        'vehicleSelector-button--active': isActive,
      })}
      onClick={onClick}
      title={label}
      role="radio"
      aria-label={label}
      aria-checked={isActive}
    >
      <VehicleIcon vehicle={vehicle} fill="currentColor" height={isMobile ? 14 : 20} />
      <div className="vehicleSelector-buttonLabel">{label}</div>
    </button>
  );
};

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
      />
    ))}
  </div>
);

export default VehicleSelector;
