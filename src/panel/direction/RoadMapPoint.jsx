import React from 'react';
import RoadMapItem from './RoadMapItem';
import { getInputValue } from 'src/libs/suggest';
import Address from 'src/components/ui/Address';
import PlaceIcon from 'src/components/PlaceIcon';

const RoadMapPoint = ({ point, ...rest }) => {
  const { address, type } = point;

  return <RoadMapItem
    icon={<PlaceIcon place={point} withBackground />}
    {...rest}
  >
    <div className="u-text--smallTitle">{getInputValue(point)}</div>
    {type !== 'geoloc' &&
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
