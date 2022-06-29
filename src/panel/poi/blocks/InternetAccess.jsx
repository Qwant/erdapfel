import React from 'react';
import Block from './Block';
import { useI18n } from 'src/hooks';
import { IconWifi } from 'src/components/ui/icons';

const InternetAccessBlock = ({ block }) => {
  const { _ } = useI18n();

  if (!block.wifi) {
    return null;
  }

  return (
    <Block simple icon={<IconWifi fill="var(--green-500)" width={20} />}>{`${_(
      'Internet access',
      'poi'
    )} : ${_('WiFi', 'poi')}`}</Block>
  );
};

export default InternetAccessBlock;
