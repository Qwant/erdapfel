import React from 'react';
import RoadMapItem from './RoadMapItem';
import { getInputValue } from 'src/libs/suggest';
import Address from 'src/components/ui/Address';

const RoadMapPoint = ({ point, icon, ...rest }) => {
  const { address, type } = point;
  return <RoadMapItem icon={icon} {...rest}>
    <div className="u-text--smallTitle">{getInputValue(point)}</div>
    {type !== 'latlon' && type !== 'geoloc' &&
      <div className="u-text--subtitle">
        <Address
          address={address}
          omitStreet={type === 'house' || type === 'street'}
          omitCountry
          inline
        />
      </div>}
  </RoadMapItem>;
};

export default RoadMapPoint;
