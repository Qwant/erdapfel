/* global _ */
import React from 'react';

import Block from 'src/panel/poi/blocks/Block';
import { IconMapPin } from 'src/components/ui/icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import Address from 'src/components/ui/Address';

const AddressBlock = ({ address }) => (
  <Block
    className="block-address"
    icon={<IconMapPin width={20} fill={ACTION_BLUE_BASE} />}
    title={_('address')}
  >
    <Address inline address={address} omitCountry />
  </Block>
);

export default AddressBlock;
