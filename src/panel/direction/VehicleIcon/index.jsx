import React from 'react';
import { IconCar, IconBus, IconBicycle, IconWalk } from 'src/components/ui/icons';

const VehicleIcon = ({ vehicle, ...rest }) => {
  const icons = {
    driving: IconCar,
    walking: IconWalk,
    cycling: IconBicycle,
    publicTransport: IconBus,
  };

  const Icon = icons[vehicle];
  return Icon ? <Icon {...rest} /> : null;
};

export default VehicleIcon;
