import React from 'react';

const PublicTransportLine = ({ mode, info }) => {
  // @TODO: translate
  // @TODO: use network-specific iconography where possible
  let type = 'ligne';
  if (mode.startsWith('BUS')) {
    type = `bus ${info.network}`;
  } else if (mode.startsWith('SUBWAY')) {
    type = 'métro';
  } else if (mode.startsWith('TRAM')) {
    type = 'tram';
  } else if (info.network === 'RER') {
    type = 'RER';
  } else if (mode.indexOf('TRAIN') !== -1) {
    type = `train ${info.network}`;
  }
  return <span className="routePtLine">{type} {info.num}</span>;
};

export default PublicTransportLine;
