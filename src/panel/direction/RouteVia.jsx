/* global _ */
import React from 'react';
import PublicTransportLine from './PublicTransportLine';

const RouteVia = ({ route, vehicle }) => {
  if (vehicle !== 'publicTransport') {
    return <div className="routeVia">
      {_('Via', 'direction')} {route.summary.replace(/^(.*), (.*)$/, '$1')}
    </div>;
  }

  return <div className="routeVia">
    {route.steps
      // removes multiple 'WALK' parts
      .filter((step, index, steps) =>
        !(step.mode === 'WALK' && index > 0 && steps[index - 1].mode === 'WALK')
      )
      .map((step, idx) => <span key={idx} className="routeVia-step">
        {step.mode === 'WALK'
          ? <i className="icon-foot" />
          : <PublicTransportLine mode={step.mode} info={step.info} />
        }
      </span>)
    }
  </div>;
};

export default RouteVia;
