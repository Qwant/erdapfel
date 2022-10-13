import React from 'react';
import cx from 'classnames';
import VehicleIcon from 'src/panel/direction/VehicleIcon';

export type VehicleSelectorButtonProps = {
  vehicle: 'driving' | 'walking' | 'cycling' | 'publicTransport';
  isActive: boolean;
  onClick: React.HTMLProps<HTMLButtonElement>['onClick'];
  title: string;
};

const VehicleSelectorButton: React.FunctionComponent<VehicleSelectorButtonProps> = ({
  vehicle,
  isActive,
  onClick,
  title = '',
}) => {
  return (
    <button
      type="button"
      data-testid={`vehicleSelector-button-${vehicle}`}
      className={cx('vehicleSelector-button', isActive && 'vehicleSelector-button--active')}
      onClick={onClick}
      title={title}
      role="radio"
      aria-label={vehicle}
      aria-checked={isActive}
    >
      <VehicleIcon vehicle={vehicle} fill="currentColor" />
    </button>
  );
};

export default VehicleSelectorButton;
