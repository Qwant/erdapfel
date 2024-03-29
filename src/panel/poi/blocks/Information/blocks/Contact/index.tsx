import React from 'react';
import { components } from 'appTypes/idunn';
import Block from 'src/panel/poi/blocks/Block';
import { IconMail } from '@qwant/qwant-ponents';

export type PoiContactBlockProps = {
  texts?: {
    contact: string;
  };
  block: components['schemas']['ContactBlock'];
};

const ContactBlock: React.FunctionComponent<PoiContactBlockProps> = ({ block, texts }) => {
  return (
    <Block
      className="block-contact"
      title={texts?.contact}
      icon={<IconMail size={20} fill="var(--green-500)" />}
      href={block?.url}
    >
      {block?.email}
    </Block>
  );
};

export default ContactBlock;
