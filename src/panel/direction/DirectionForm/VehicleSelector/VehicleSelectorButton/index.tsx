import React from 'react';
import cx from 'classnames';
import VehicleIcon from 'src/panel/direction/VehicleIcon';
import { useI18n } from 'src/hooks';

export type VehicleSelectorButtonProps = {
  vehicle: 'driving' | 'walking' | 'cycling' | 'publicTransport';
  isActive: boolean;
  onClick: React.HTMLProps<HTMLButtonElement>['onClick'];
};

const VehicleSelectorButton: React.FunctionComponent<VehicleSelectorButtonProps> = ({
  vehicle,
  isActive,
  onClick,
}) => {
  const { _ } = useI18n();
  const label = {
    driving: 'by car',
    walking: 'on foot',
    cycling: 'by bike',
    publicTransport: 'transit',
  }[vehicle];

  return (
    <button
      type="button"
      data-testid={`vehicleSelector-button-${vehicle}`}
      className={cx('vehicleSelector-button', isActive && 'vehicleSelector-button--active')}
      onClick={onClick}
      title={_(label)}
      role="radio"
      aria-label={vehicle}
      aria-checked={isActive}
    >
      <VehicleIcon vehicle={vehicle} fill="currentColor" />
    </button>
  );
};

export default VehicleSelectorButton;
