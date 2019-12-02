import React from 'react';
import classnames from 'classnames';
import { getVehicleIcon } from 'src/libs/route_utils';

const VehicleSelector = ({ vehicles, activeVehicle, onSelectVehicle }) =>
  <div className="itinerary_vehicles">
    {vehicles.map(vehicle => <span
      key={vehicle}
      className={classnames(`itinerary_button_label ${getVehicleIcon(vehicle)}`,
        { 'label_active': vehicle === activeVehicle }
      )}
      onClick={() => onSelectVehicle(vehicle)}
    />)}
  </div>;

export default VehicleSelector;
