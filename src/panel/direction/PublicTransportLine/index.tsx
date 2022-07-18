/* global _ */
import React from 'react';
import Color from 'color';
import cx from 'classnames';
import { components } from 'appTypes/idunn';
import { Text } from '@qwant/qwant-ponents';

export type PublicTransportLineProps = {
  mode: components['schemas']['TransportMode'];
  info?: components['schemas']['TransportInfo'];
  showDirection?: boolean;
};

const PublicTransportLine: React.FunctionComponent<PublicTransportLineProps> = ({
  mode,
  info,
  showDirection = false,
}) => {
  let type = 'ligne';
  if (mode.startsWith('BUS')) {
    type = 'bus';
  } else if (mode.startsWith('SUBWAY')) {
    type = 'métro';
  } else if (mode.startsWith('TRAM')) {
    type = 'tram';
  } else if (mode.indexOf('TRAIN') !== -1) {
    if (info?.num?.startsWith('RER')) {
      type = '';
    } else {
      type = `train ${info?.network}`;
    }
  }
  const lineColor = info?.lineColor ? Color('#' + info.lineColor) : Color('white');
  return (
    <>
      <span
        className={cx('routePtLine', { 'routePtLine--dark': lineColor.isDark() })}
        style={{
          backgroundColor: lineColor.hex(),
          borderColor: lineColor.rgbNumber() === 0xffffff ? 'black' : lineColor.hex(),
        }}
      >
        {type} {info?.num}
      </span>
      {showDirection && (
        <Text typo="body-2">
          {_('Towards {direction}', 'direction')?.replace('{direction}', info?.direction ?? '')}
        </Text>
      )}
    </>
  );
};

export default PublicTransportLine;
