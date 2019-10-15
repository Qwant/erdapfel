/* global _ */
import React from 'react';
import PublicTransportLine from './PublicTransportLine';

const RouteVia = ({ route, vehicle }) => {
  if (vehicle !== 'publicTransport') {
    return <div className="routeVia">
      {_('Via', 'direction')} {route.legs[0].summary.replace(/^(.*), (.*)$/, '$1')}
    </div>;
  }

  return <div className="routeVia">
    {route.summary.map((summary, idx) =>
      <span key={idx} className="routeVia-step">
        {summary.mode === 'WALK'
          ? <i className="icon-foot" />
          : <PublicTransportLine mode={summary.mode} info={summary.info} />
        }
      </span>)
    }
  </div>;
};

export default RouteVia;
