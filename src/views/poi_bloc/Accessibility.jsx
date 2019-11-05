/* global _ */
import React from 'react';

const AccessibilityBlock = ({
  block: accessibilityList,
  _poi,
  options: accessibilities,
  asString,
}) => {
  const availableAccessibilities = accessibilities.map(a11y =>
    _(a11y.labels[accessibilityList[a11y.key]])
  );

  if (asString) {
    return availableAccessibilities.join('. ');
  }

  return <div>
    <h6 className="poi_panel__sub__sub_block__title">{ _('Accessibility', 'poi') }</h6>
    <ul className="poi_panel__info__accessibilities">
      {availableAccessibilities.map((a11y, index) => <li key={index}>{a11y}</li>)}
    </ul>
  </div>;
};

export default AccessibilityBlock;
