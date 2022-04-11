import React from 'react';
import Block from 'src/panel/poi/blocks/Block';
import { IconMapPinLine } from '@qwant/qwant-ponents';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import Address from 'src/components/ui/Address';
import { useI18n } from 'src/hooks';

const AddressBlock = ({ address }) => {
  const { _ } = useI18n();

  return (
    <Block
      className="block-address"
      icon={<IconMapPinLine size={20} fill={ACTION_BLUE_BASE} />}
      title={_('address')}
    >
      <Address inline address={address} omitCountry />
    </Block>
  );
};

export default AddressBlock;
