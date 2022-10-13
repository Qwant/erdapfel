import React from 'react';
import { getTransportTypeIcon, formatDistance, formatDuration } from 'src/libs/route_utils';
import VehicleIcon from '../VehicleIcon';

const PublicTransportIcon = ({ mode }) => (
  <div
    className={`publicTransportLabelItem roadmapIcon roadmapIcon--${getTransportTypeIcon({
      mode,
    })}`}
  />
);

const PublicTransportStepIcons = ({ route }) => {
  const nonWalkLegs = route.legs.filter(leg => leg.mode !== 'WALK');

  if (nonWalkLegs.length <= 3) {
    return (
      <div>
        {nonWalkLegs.map((leg, index) => (
          <PublicTransportIcon key={index} mode={leg.mode} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <PublicTransportIcon mode={nonWalkLegs[0].mode} />
      <div className="publicTransportLabelItem roadmapIcon u-text--caption roadmapIcon--inbetween">
        <div>+{nonWalkLegs.length - 2}</div>
      </div>
      <PublicTransportIcon mode={nonWalkLegs[nonWalkLegs.length - 1].mode} />
    </div>
  );
};

const RouteLabel = ({ route, vehicle, anchor }) => {
  const isPublicTransport = vehicle === 'publicTransport';
  return (
    <div data-id={route.id} className={`routeLabel routeLabel--${anchor} routeLabel--${vehicle}`}>
      {isPublicTransport ? (
        <PublicTransportStepIcons route={route} />
      ) : (
        <div className="routeLabel-vehicleIcon">
          <VehicleIcon vehicle={vehicle} fill="currentColor" width={24} />
        </div>
      )}
      <div>
        <div className="routeLabel-duration">{formatDuration(route.duration)}</div>
        {!isPublicTransport && (
          <div className="routeLabel-distance">{formatDistance(route.distance)}</div>
        )}
      </div>
    </div>
  );
};

export default RouteLabel;
