import React from 'react';
import { useI18n } from 'src/hooks';
import Block from 'src/panel/poi/blocks/Block';
import { IconMail } from '@qwant/qwant-ponents';
import { ACTION_BLUE_BASE } from 'src/libs/colors';

const ContactBlock = ({ block }) => {
  const { _ } = useI18n();

  return (
    <Block
      className="block-contact"
      title={_('contact')}
      icon={<IconMail size={20} fill={ACTION_BLUE_BASE} />}
      href={block.url}
    >
      {block.email}
    </Block>
  );
};

export default ContactBlock;
