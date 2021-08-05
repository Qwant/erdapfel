/* global _ */
import React from 'react';
import Block from './Block';
import { IconWheelchair } from 'src/components/ui/icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';

const AccessibilityBlock = ({ block: accessibilityList }) => {
  const labels = {
    wheelchair: {
      yes: _('Wheelchair accessible'),
      partial: _('Partially wheelchair accessible'),
      no: _('Not wheelchair accessible'),
    },
    toilets_wheelchair: {
      yes: _('Wheelchair accessible toilets'),
      partial: _('Partial wheelchair accessible toilets'),
      no: _('No wheelchair accessible toilets'),
    },
  };
  const availableAccessibilities = [];
  for (const [label, elems] of Object.entries(labels)) {
    availableAccessibilities.push(elems[accessibilityList[label]]);
  }

  return (
    <Block
      icon={<IconWheelchair fill={ACTION_BLUE_BASE} width={20} height={20} />}
      className="block-accessibility"
      simple
    >
      {availableAccessibilities.filter(a => a).join(' ; ')}
    </Block>
  );
};

export default AccessibilityBlock;
