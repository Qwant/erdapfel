/* global _ */
import React from 'react';
import PublicTransportLine from './PublicTransportLine';

const RouteVia = ({ route, vehicle }) => {
  if (vehicle !== 'publicTransport') {
    return <div className="routeVia">
      {_('Via', 'direction')} {route.legs[0].summary.replace(/^(.*), (.*)$/, '$1')}
    </div>;
  } else if (route.summary) {
    return <div className="routeVia">
      {route.summary
        .filter(summaryPart => summaryPart.mode !== 'WAIT')
        .filter(summaryPart => summaryPart.mode !== 'WALK' || summaryPart.distance > 100)
        .map((summaryPart, idx) =>
          <span key={idx} className="routeVia-step">
            {summaryPart.mode === 'WALK'
              ? <i className="icon-foot"/>
              : <PublicTransportLine mode={summaryPart.mode} info={summaryPart.info}/>
            }
          </span>
        )
      }
    </div>;
  } else {
    return <div></div>;
  }
};

export default RouteVia;
