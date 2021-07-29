import React from 'react';
import Block from './Block';
import { useI18n } from 'src/hooks';
import { IconScooter } from 'src/components/ui/icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';

const DeliveryBlock = ({ block }) => {
  const { _ } = useI18n();

  const modes = [
    { key: 'click_and_collect', label: _('Click & collect') },
    { key: 'delivery', label: _('Delivery') },
    { key: 'takeaway', label: _('Take away') },
  ];

  return (
    <Block icon={<IconScooter fill={ACTION_BLUE_BASE} width={20} />}>
      {modes
        .filter(mode => block[mode.key] === 'yes')
        .map(mode => mode.label)
        .join(' ⋅ ')}
    </Block>
  );
};

export default DeliveryBlock;
