import React from 'react';

import Block from 'src/components/ui/Block';

const ContactBlock = ({
  block,
}) => {
  return <Block title="contact" icon="mail">
    <a className="block-contact-link" style={{ color: 'inherit' }} href={ block.url }>
      { block.url.replace('mailto:', '') }
    </a>
  </Block>;
};

export default ContactBlock;
