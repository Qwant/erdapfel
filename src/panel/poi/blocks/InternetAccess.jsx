import React from 'react';
import Block from './Block';
import { useI18n } from 'src/hooks';
import { IconWifi } from 'src/components/ui/icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';

const InternetAccessBlock = ({ block }) => {
  const { _ } = useI18n();

  if (!block.wifi) {
    return null;
  }

  return (
    <Block simple icon={<IconWifi fill={ACTION_BLUE_BASE} width={20} />}>{`${_(
      'Internet access',
      'poi'
    )} : ${_('WiFi', 'poi')}`}</Block>
  );
};

export default InternetAccessBlock;
