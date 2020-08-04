import React from 'react';
import PropTypes from 'prop-types';
import { toArray } from 'src/libs/address';

const Address = ({ address }) =>
  <div>
    {toArray(address).map((item, index) => <div key={index}>{item}</div>)}
  </div>;

Address.propTypes = {
  address: PropTypes.object.isRequired,
};

export default Address;
