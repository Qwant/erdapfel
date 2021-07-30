import React from 'react';
import Block from './Block';
import { useI18n } from 'src/hooks';
import { IconScooter } from 'src/components/ui/icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';

const modes = ['click_and_collect', 'delivery', 'takeaway'];

const getActiveModes = delivery =>
  Object.entries(delivery || {})
    .filter(([mode]) => modes.includes(mode))
    .filter(([_mode, value]) => value === 'yes');

const DeliveryBlock = ({ block }) => {
  const { _ } = useI18n();

  const labels = {
    click_and_collect: _('Click & collect'),
    delivery: _('Delivery'),
    takeaway: _('Take away'),
  };

  return (
    <Block icon={<IconScooter fill={ACTION_BLUE_BASE} width={20} />}>
      {getActiveModes(block)
        .map(([mode]) => labels[mode])
        .join(' ⋅ ')}
    </Block>
  );
};

export default DeliveryBlock;

export const hasActiveDeliveryModes = delivery => getActiveModes(delivery).length > 0;
