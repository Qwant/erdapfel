/* global _ */
import React from 'react';

import Block from 'src/panel/poi/blocks/Block';
import { IconMail } from 'src/components/ui/icons';
import { ACTION_BLUE_BASE } from 'src/libs/colors';

const ContactBlock = ({ block }) => {
  return (
    <Block
      className="block-contact"
      title={_('contact')}
      icon={<IconMail width={20} fill={ACTION_BLUE_BASE} />}
      href={block.url}
    >
      {block.email}
    </Block>
  );
};

export default ContactBlock;
