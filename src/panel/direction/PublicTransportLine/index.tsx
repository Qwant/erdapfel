/* global _ */
import React from 'react';
import Color from 'color';
import cx from 'classnames';
import { components } from 'appTypes/idunn';
import { Text } from '@qwant/qwant-ponents';
import DefaultRoadMapIcon from '../RoutesList/Route/RoadMap/Default/DefaultRoadMapIcon';
import { getTransportTypeIcon } from 'src/libs/route_utils';

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
    type = '';
  } else if (mode.startsWith('SUBWAY')) {
    type = 'M';
  } else if (mode.startsWith('TRAM')) {
    type = 'T';
  } else if (mode.indexOf('TRAIN') !== -1) {
    if (info?.num?.startsWith('RER')) {
      type = '';
    } else {
      type = `${info?.network} `;
    }
  }
  const lineColor = info?.lineColor ? Color('#' + info.lineColor) : Color('white');
  return (
    <>
      <div className="oval" />
      {mode && (
        <DefaultRoadMapIcon
          className="routePtLine__transport-icon"
          iconClass={getTransportTypeIcon({ mode })}
        />
      )}
      <span
        className={cx('routePtLine', { 'routePtLine--dark': lineColor.isDark() })}
        style={{
          backgroundColor: lineColor.hex(),
          borderColor: lineColor.rgbNumber() === 0xffffff ? 'black' : lineColor.hex(),
          marginRight: showDirection ? 'var(--spacing-xs)' : '0',
        }}
      >
        {type}
        {info?.num}
      </span>
      {showDirection && (
        <Text typo="body-2" color="secondary" as="span">
          {_('Towards {direction}', 'direction')?.replace('{direction}', info?.direction ?? '')}
        </Text>
      )}
    </>
  );
};

export default PublicTransportLine;
