/* global _ */
import React, { useState } from 'react';

const PhoneNumber = ({ phoneBlock, onReveal }) => {
  const [isNumberHidden, setIsNumberHidden] = useState(true);

  return <div className="category__panel__phone" onClick={e => {
    e.stopPropagation();
    if (!isNumberHidden) { return; }
    setIsNumberHidden(false);
    if (onReveal) { onReveal(); }
  }}>
    <span className="icon-icon_phone" />
    {isNumberHidden
      ? <span>{_('SHOW NUMBER', 'poi')}</span>
      : <a href={phoneBlock.url}>{phoneBlock.local_format}</a>}
  </div>;
};

export default PhoneNumber;
