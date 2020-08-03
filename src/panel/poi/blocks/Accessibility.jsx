/* global _ */
import React from 'react';

const AccessibilityBlock = ({
  block: accessibilityList,
  asString,
}) => {
  const labels = {
    'wheelchair': {
      'yes': _('Wheelchair accessible'),
      'partial': _('Partially wheelchair accessible'),
      'no': _('Not wheelchair accessible'),
    },
    'toilets_wheelchair': {
      'yes': _('Wheelchair accessible toilets'),
      'partial': _('Partial wheelchair accessible toilets'),
      'no': _('No wheelchair accessible toilets'),
    },
  };
  const availableAccessibilities = [];
  for (const [label, elems] of Object.entries(labels)) {
    availableAccessibilities.push(elems[accessibilityList[label]]);
  }

  if (asString) {
    return availableAccessibilities.join('. ');
  }
  return <div>
    <h6 className="u-text--caption u-mb-8">{ _('Accessibility', 'poi') }</h6>
    <ul className="poi_panel__info__accessibilities">
      { availableAccessibilities.map((el, index) => <li key={index}>{el}</li>) }
    </ul>
  </div>;
};

export default AccessibilityBlock;
