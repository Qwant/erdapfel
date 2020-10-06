/* global _ */
import React from 'react';
import classnames from 'classnames';
import { getVehicleIcon } from 'src/libs/route_utils';
import { capitalizeFirst } from 'src/libs/string';

const getLocalizedTitle = vehicle => {
  if (vehicle === 'driving') { return _('by car', 'direction'); }
  if (vehicle === 'publicTransport') {return _('transit', 'direction'); }
  if (vehicle === 'walking') { return _('on foot', 'direction'); }
  if (vehicle === 'cycling') { return _('by bike', 'direction'); }
  return _(vehicle); // this can not be parsed by our i18n scripts
};

const VehicleSelectorButton = ({ vehicle, isActive, onClick }) => {
  const label = capitalizeFirst(getLocalizedTitle(vehicle));
  return <button
    type="button"
    className={classnames('vehicleSelector-button', { 'vehicleSelector-button--active': isActive })}
    onClick={onClick}
    title={label}
    role="radio"
    aria-label={label}
    aria-checked={isActive}
  >
    <div className={classnames('vehicleSelector-buttonIcon', getVehicleIcon(vehicle))} />
    <div className="vehicleSelector-buttonLabel">{label}</div>
  </button>;
};

const VehicleSelector = ({ vehicles, activeVehicle, onSelectVehicle }) =>
  <div
    className={classnames('vehicleSelector',
      { 'vehicleSelector--withPublicTransport': vehicles.length > 3 }
    )}
    role="radiogroup"
  >
    {vehicles.map(vehicle => <VehicleSelectorButton
      key={vehicle}
      vehicle={vehicle}
      isActive={vehicle === activeVehicle}
      onClick={() => onSelectVehicle(vehicle)}
    />)}
  </div>;

export default VehicleSelector;
