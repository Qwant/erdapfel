import React from 'react';
import DefaultRoadMapItem from '../DefaultRoadMapItem';
import { getInputValue } from 'src/libs/suggest';
import Address from 'src/components/ui/Address';
import PlaceIcon from 'src/components/PlaceIcon';

const DefaultRoadMapPoint = ({ point, ...rest }) => {
  const { address, type } = point;

  return (
    <DefaultRoadMapItem icon={<PlaceIcon place={point} withBackground />} {...rest}>
      <div className="u-text--smallTitle">{getInputValue(point)}</div>
      {type !== 'geoloc' && (
        <div className="u-text--subtitle">
          <Address
            address={address}
            omitStreet={type === 'house' || type === 'street' || type === 'latlon'}
            omitCountry
            inline
          />
        </div>
      )}
    </DefaultRoadMapItem>
  );
};

export default DefaultRoadMapPoint;
