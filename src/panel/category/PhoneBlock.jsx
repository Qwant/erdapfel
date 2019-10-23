/* global _ */
import React, { useState } from 'react';

const PhoneBlock = ({ phoneBlock }) => {
  const [isNumberHidden, setIsNumberHidden] = useState(true);

  return <div className="category__panel__phone" onClick={e => {
    e.stopPropagation();
    setIsNumberHidden(!isNumberHidden);
  }}>
    <span className="icon-icon_phone" />
    {isNumberHidden
      ? <span>{_('SHOW NUMBER', 'poi')}</span>
      : <a href={phoneBlock.url}>{phoneBlock.local_format}</a>}
  </div>;
};

export default PhoneBlock;
