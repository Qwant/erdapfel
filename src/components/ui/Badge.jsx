import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Badge = ({ children, className }) =>
  <div className={classNames('badge', className)}>{children}</div>
;

Badge.propTypes = {
  children: PropTypes.string.isRequired,
};

export default Badge;
