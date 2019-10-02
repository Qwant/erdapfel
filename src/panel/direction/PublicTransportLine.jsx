import React from 'react';

const PublicTransportLine = ({ mode, info }) => {
  // @TODO: translate
  // @TODO: use network-specific iconography where possible
  let type = 'ligne';
  if (mode.startsWith('BUS')) {
    type = 'bus';
  } else if (mode.startsWith('SUBWAY')) {
    type = 'métro';
  } else if (mode.startsWith('TRAM')) {
    type = 'tram';
  } else if (mode.startsWith('SUBURBAN')) {
    type = 'RER';
  }
  return <span className="routePtLine">{type} {info.num}</span>;
};

export default PublicTransportLine;
