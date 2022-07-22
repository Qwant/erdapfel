/* global _ */
import React, { useMemo } from 'react';
import cx from 'classnames';
import PublicTransportLine from '../../PublicTransportLine';
import VehicleIcon from '../../VehicleIcon';
import { components } from 'appTypes/idunn';

type RouteViaPublicTransportProps = Omit<RouteViaProps, 'vehicle'>;

const RouteViaPublicTransport: React.FunctionComponent<RouteViaPublicTransportProps> = ({
  className,
  route,
}) => {
  const displaySummaryParts = useMemo(() => {
    return (route?.summary ?? []).filter(summaryPart => summaryPart.mode !== 'WAIT');
  }, [route?.summary]);

  return (
    <div className={cx('routeVia', className)}>
      {displaySummaryParts?.map((summaryPart, idx) => (
        <span key={idx} className="routeVia-step">
          {summaryPart.mode === 'WALK' ? (
            <VehicleIcon vehicle="walking" fill="currentColor" />
          ) : (
            <PublicTransportLine mode={summaryPart.mode} info={summaryPart.info} />
          )}
        </span>
      ))}
    </div>
  );
};

export type RouteViaProps = {
  className?: string;
  route?: components['schemas']['DirectionsRoute'];
  vehicle?: 'driving' | 'walking' | 'cycling' | 'publicTransport';
};

const RouteVia: React.FunctionComponent<RouteViaProps> = ({ route, vehicle, className }) => {
  return vehicle === 'publicTransport' ? (
    <RouteViaPublicTransport className={className} route={route} />
  ) : (
    <div className={cx('routeVia', className)}>
      {_('Via', 'direction')} {route?.legs[0]?.summary?.replace(/^(.*), (.*)$/, '$1')}
    </div>
  );
};

export default RouteVia;
