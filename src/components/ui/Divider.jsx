import React from 'react';
import cx from 'classnames';

const Divider = ({ className, paddingTop = 20, paddingBottom = 20, marginLeft = 0 }) =>
  <div
    className={cx('divider', className)}
    style={{
      padding: `${paddingTop}px 0 ${paddingBottom}px 0`,
      marginLeft,
    }}
  >
    <div className="divider-line" />
  </div>
;

export default Divider;
