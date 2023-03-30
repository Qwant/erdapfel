/* global _ */
import React from 'react';
import cx from 'classnames';
import poiSubClass from 'src/mapbox/poi_subclass';
import { capitalizeFirst } from 'src/libs/string';
import Address from 'src/components/ui/Address';
import { Flex, Text } from '@qwant/qwant-ponents';

const PoiTitle = ({ poi, withAlternativeName, inList }) => {
  const { name, localName, subClassName, address } = poi;
  // LatLon PoI
  if (subClassName === 'latlon') {
    const latLon = name;

    // Close to (address) + GPS coordinates
    if (address) {
      return (
        <div className="poiTitle">
          <div className="u-text--subtitle u-italic u-mb-xxs">{_('Close to', 'poi')}</div>
          <Text
            className={cx('poiTitle-main', inList && 'u-ellipsis')}
            typo={inList ? 'body-1' : 'heading-4'}
            color="primary"
            bold
          >
            <Address address={address} omitCountry />
          </Text>
          <div className="poiTitle-position">{latLon}</div>
        </div>
      );
    }

    // GPS coordinates only
    return (
      <div className="poiTitle">
        <h2 className="poiTitle-main u-text--smallTitle u-mb-xxs">
          {_('Geographic coordinates', 'poi')}
        </h2>
        <div className="poiTitle-position">{latLon}</div>
      </div>
    );
  }

  const title = name || localName;
  const alternative = withAlternativeName && name && localName && localName !== name && localName;
  const subclass = capitalizeFirst(poiSubClass(subClassName));

  // Location / address
  return (
    <Flex className="poiTitle" column fullWidth>
      <Text
        className={cx('poiTitle-main', inList && 'u-ellipsis')}
        typo={inList ? 'body-1' : 'heading-4'}
        color="primary"
        bold
      >
        {title || subclass}
      </Text>
      {alternative && (
        <Flex mb="xxs" className="poiTitle-alternative u-text--subtitle u-italic">
          {alternative}
        </Flex>
      )}
    </Flex>
  );
};

export default PoiTitle;
