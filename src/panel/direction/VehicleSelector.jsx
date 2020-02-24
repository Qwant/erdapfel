/* global _ */
import React from 'react';
import classnames from 'classnames';
import { getVehicleIcon } from 'src/libs/route_utils';

const VehicleSelector = ({ vehicles, activeVehicle, onSelectVehicle }) =>
  <div className={classnames('itinerary_vehicles',
    { 'itinerary_vehicles--withPublicTransport': vehicles.length > 3 }
  )}>
    {vehicles.map(vehicle => <button
      type="button"
      key={vehicle}
      className={classnames(`itinerary_vehicle_button ${getVehicleIcon(vehicle)}`,
        { 'itinerary_vehicle_button--active': vehicle === activeVehicle }
      )}
      onClick={() => onSelectVehicle(vehicle)}
      aria-label={vehicle}
    >
      {vehicle === 'publicTransport' && <span className="testLabel">{_('Test')}</span>}
    </button>)}
  </div>;

export default VehicleSelector;
