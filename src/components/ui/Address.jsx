import React from 'react';
import PropTypes from 'prop-types';
import { toArray } from 'src/libs/address';

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
