/* global _ */
import React from 'react';
import classnames from 'classnames';
import { getVehicleIcon } from 'src/libs/route_utils';

const getLocalizedTitle = vehicle => {
  if (vehicle === 'driving') { return _('By car', 'direction'); }
  if (vehicle === 'publicTransport') {return _('By public transport', 'direction'); }
  if (vehicle === 'walking') { return _('By foot', 'direction'); }
  if (vehicle === 'cycling') { return _('By bike', 'direction'); }
  return _(vehicle); // this can not be parsed by our i18n scripts
};

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
      title={getLocalizedTitle(vehicle)}
    >
      {vehicle === 'publicTransport' && <span className="testLabel">{_('Test')}</span>}
    </button>)}
  </div>;

export default VehicleSelector;
