import React from 'react';
import PropTypes from 'prop-types';

/**
 * Filter an address and return an array with the relevant items
 * @param {*} address - an address object
 */
function toArray(address, omitStreet) {
  if (!address.street) {
    return [
      address.suburb,
      address.cityDistrict,
      address.city,
      address.stateDistrict,
      address.state,
      address.countryRegion,
      address.country,
    ]
      .filter(i => i)
      .filter((item, pos, arr) => pos === 0 || item !== arr[pos - 1]); // remove consecutive duplicated name
  }

  const cityAndPostcode = address.postcode && address.city
    ? address.postcode + ' ' + address.city
    : address.city;

  return [!omitStreet && address.street, cityAndPostcode, address.country]
    .filter(i => i); // Filter out any undefined value
}

const Address = ({ address, inline, omitStreet }) => {
  const parts = toArray(address, omitStreet);
  return inline
    ? parts.join(', ')
    : <div>
      {toArray(address).map((item, index) => <div key={index}>{item}</div>)}
    </div>;
};

Address.propTypes = {
  address: PropTypes.object.isRequired,
  inline: PropTypes.bool,
  omitStreet: PropTypes.bool,
};

export default Address;
