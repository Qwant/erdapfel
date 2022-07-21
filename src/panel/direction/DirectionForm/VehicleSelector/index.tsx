import React from 'react';
import classnames from 'classnames';
import VehicleSelectorButton from './VehicleSelectorButton';

type VehicleType = 'driving' | 'walking' | 'cycling' | 'publicTransport';

export type VehicleSelectorProps = {
  vehicles: VehicleType[];
  activeVehicle: string;
  onSelectVehicle: (vehicle: string) => void;
  texts: Record<VehicleType, string>;
};

const VehicleSelector: React.FunctionComponent<VehicleSelectorProps> = ({
  vehicles,
  activeVehicle,
  onSelectVehicle,
  texts,
}) => (
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
        title={texts?.[vehicle]}
      />
    ))}
  </div>
);

export default VehicleSelector;
