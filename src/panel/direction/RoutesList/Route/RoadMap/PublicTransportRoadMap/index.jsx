import React from 'react';
import PublicTransportWalkLeg from '../PublicTransportWalkLeg';
import PublicTransportLineLeg from '../PublicTransportLineLeg';
import PublicTransportRoadMapPoint from '../PublicTransportRoadMapPoint';
import { Address } from 'src/components/ui';
import { getInputValue } from 'src/libs/suggest';
import { Flex, Text } from '@qwant/qwant-ponents';
import { getTimeFormatter } from 'src/libs/time';

const Leg = ({ leg }) => {
  // @TODO: decide what to do with waiting parts. For now just ignore.
  if (leg.mode === 'WAIT') {
    return null;
  }

  return leg.mode === 'WALK' ? (
    <PublicTransportWalkLeg leg={leg} />
  ) : (
    <PublicTransportLineLeg leg={leg} />
  );
};

const PublicTransportRoadMap = ({ route, origin, destination }) => {
  const originProps = {
    hour: getTimeFormatter({ hour: '2-digit', minute: '2-digit' }).format(
      new Date(route.start_time)
    ),
    title: getInputValue(origin),
    details: (
      <Address
        address={origin?.address}
        omitStreet={
          origin?.type === 'house' || origin?.type === 'street' || origin?.type === 'latlon'
        }
        omitCountry
        inline
      />
    ),
  };

  const destinationProps = {
    hour: getTimeFormatter({ hour: '2-digit', minute: '2-digit' }).format(new Date(route.end_time)),
    title: getInputValue(destination),
    details: (
      <Address
        address={destination?.address}
        omitStreet={
          destination?.type === 'house' ||
          destination?.type === 'street' ||
          destination?.type === 'latlon'
        }
        omitCountry
        inline
      />
    ),
  };

  return (
    <div className="itinerary_roadmap itinerary_roadmap--publicTransport">
      <Flex takeAvailableSpace my="s">
        <Flex className="left-part">
          <Text className="hour" typo="body-2" bold>
            {originProps.hour}
          </Text>
          <div className="container-pin">
            <div className="oval" />
          </div>
        </Flex>
        <PublicTransportRoadMapPoint {...originProps} />
      </Flex>
      {route.legs.map((leg, index) => (
        <Leg key={index} leg={leg} />
      ))}
      <Flex takeAvailableSpace my="s">
        <Flex className="left-part">
          <Text className="hour" typo="body-2" bold>
            {destinationProps.hour}
          </Text>
          <div className="container-pin">
            <img className="destination-pin" src="./statics/images/direction_icons/pin-focus.svg" />
          </div>
        </Flex>
        <PublicTransportRoadMapPoint {...destinationProps} />
      </Flex>
    </div>
  );
};

export default PublicTransportRoadMap;
