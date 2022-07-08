import React from 'react';
import { IconCar, IconBus, IconBicycle, IconWalk } from 'src/components/ui/icons';

const VEHICLE_ICONS = {
  driving: IconCar,
  walking: IconWalk,
  cycling: IconBicycle,
  publicTransport: IconBus,
};

export type VehicleIconProps = {
  vehicle: 'driving' | 'walking' | 'cycling' | 'publicTransport';
} & React.SVGProps<SVGSVGElement>;

const VehicleIcon: React.FunctionComponent<VehicleIconProps> = ({ vehicle, ...rest }) => {
  const Icon = VEHICLE_ICONS?.[vehicle];
  return Icon ? <Icon {...rest} /> : null;
};

export default VehicleIcon;
