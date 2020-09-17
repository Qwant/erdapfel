import React from 'react';
import cx from 'classnames';

const Divider = ({ className, paddingTop = 20, paddingBottom = 20 }) =>
  <div
    className={cx('divider', className)}
    style={{
      padding: `${paddingTop}px 0 ${paddingBottom}px 0`,
    }}
  >
    <div className="divider-line" />
  </div>
;

export default Divider;
