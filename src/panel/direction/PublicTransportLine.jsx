import React from 'react';
import Color from 'color';
import classnames from 'classnames';

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
  const lineColor = info.lineColor ? Color('#' + info.lineColor) : Color('white');
  return <span
    className={classnames('routePtLine', { 'routePtLine--dark': lineColor.isDark() })}
    style={{
      backgroundColor: lineColor.hex(),
      borderColor: lineColor.rgbNumber() === 0xffffff ? 'black' : lineColor.hex(),
    }}
  >
    {type} {info.num}
  </span>;
};

export default PublicTransportLine;
