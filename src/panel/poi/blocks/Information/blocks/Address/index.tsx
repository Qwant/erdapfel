import React from 'react';
import Block from 'src/panel/poi/blocks/Block';
import { IconMapPinLine } from '@qwant/qwant-ponents';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import Address from 'src/components/ui/Address';
import { NormalizedAddress } from 'src/libs/address';

export type PoiAddressBlockProps = {
  title?: string;
  address?: NormalizedAddress | null;
};

const PoiAddressBlock: React.FunctionComponent<PoiAddressBlockProps> = ({ title, address }) => {
  return (
    <Block
      className="block-address"
      icon={<IconMapPinLine size={20} fill={ACTION_BLUE_BASE} />}
      title={title ?? ''}
    >
      {address && <Address address={address} inline omitCountry />}
    </Block>
  );
};

export default PoiAddressBlock;
