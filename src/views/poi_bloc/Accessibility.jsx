/* global _ */
import React from 'react';

const AccessibilityBlock = ({
  block: accessibilityList,
  asString,
}) => {
  const labels = {
    'wheelchair': {
      'yes': 'Wheelchair accessible',
      'partial': 'Partially wheelchair accessible',
      'no': 'Not wheelchair accessible',
    },
    'toilets_wheelchair': {
      'yes': 'Wheelchair accessible toilets',
      'partial': 'Partial wheelchair accessible toilets',
      'no': 'No wheelchair accessible toilets',
    },
  };
  const availableAccessibilities = [];
  for (const [label, elems] of Object.entries(labels)) {
    availableAccessibilities.push(_(elems[accessibilityList[label]]));
  }

  if (asString) {
    return availableAccessibilities.join('. ');
  }
  return <div>
    <h6 className="poi_panel__sub__sub_block__title">{ _('Accessibility', 'poi') }</h6>
    <ul className="poi_panel__info__accessibilities">
      { availableAccessibilities.map(el => <li>{ el }</li>) }
    </ul>
  </div>;
};

export default AccessibilityBlock;
