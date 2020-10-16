/* global _ */
import React from 'react';
import classNames from 'classnames';
import PublicTransportLine from './PublicTransportLine';

const RouteVia = ({ route, vehicle, className }) => {
  if (vehicle !== 'publicTransport') {
    return <div className={classNames('routeVia u-text--subtitle', className)}>
      {_('Via', 'direction')} {route.legs[0].summary.replace(/^(.*), (.*)$/, '$1')}
    </div>;
  }
  return <div className={classNames('routeVia u-text--subtitle', className)}>
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
};

export default RouteVia;
