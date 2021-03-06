import React from 'react';
import PropTypes from 'prop-types';

/**
 * Filter an address and return an array with the relevant items
 * @param {*} address - an address object
 */
function toArray(address, { omitStreet, omitCountry } = {}) {
  if (!address.street) {
    return [
      address.suburb,
      address.cityDistrict,
      address.city,
      address.stateDistrict,
      address.state,
      address.countryRegion,
      !omitCountry && address.country,
    ]
      .filter(i => i)
      .filter((item, pos, arr) => pos === 0 || item !== arr[pos - 1]); // remove consecutive duplicated name
  }

  const cityAndPostcode =
    address.postcode && address.city ? address.postcode + ' ' + address.city : address.city;

  return [!omitStreet && address.street, cityAndPostcode, !omitCountry && address.country].filter(
    i => i
  ); // Filter out any undefined value
}

const Address = ({ address = {}, inline, omitStreet, omitCountry }) => {
  const parts = toArray(address, { omitStreet, omitCountry });
  return inline ? (
    parts.join(', ')
  ) : (
    <div>
      {parts.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </div>
  );
};

Address.propTypes = {
  address: PropTypes.object.isRequired,
  inline: PropTypes.bool,
  omitStreet: PropTypes.bool,
  omitCountry: PropTypes.bool,
};

export default Address;
