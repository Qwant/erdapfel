import React from 'react';
import classnames from 'classnames';
import { capitalizeFirst } from 'src/libs/string';
import VehicleIcon, { VehicleIconProps } from 'src/panel/direction/VehicleIcon';

export type VehicleSelectorButtonProps = {
  vehicle: 'driving' | 'walking' | 'cycling' | 'publicTransport';
  isActive: boolean;
  onClick: React.HTMLProps<HTMLButtonElement>['onClick'];
  texts?: {
    driving: string;
    publicTransport: string;
    walking: string;
    cycling: string;
  };
};

const VehicleSelectorButton: React.FunctionComponent<VehicleSelectorButtonProps> = ({
  vehicle,
  isActive,
  onClick,
  texts,
}) => {
  const label = capitalizeFirst(texts?.[vehicle]);
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
      <VehicleIcon vehicle={vehicle as VehicleIconProps['vehicle']} fill="currentColor" />
      <div className="vehicleSelector-buttonLabel">{label}</div>
    </button>
  );
};

export default VehicleSelectorButton;
