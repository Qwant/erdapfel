import React from 'react';
import cx from 'classnames';

const Divider = ({ className, paddingTop = 20, paddingBottom = 20 }) => (
  <div
    className={cx('divider', className)}
    style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}
  >
    <div className="divider-line" />
  </div>
);
export default Divider;
