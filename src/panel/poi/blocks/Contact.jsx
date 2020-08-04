/* global _ */
import React from 'react';

import Block from 'src/panel/poi/blocks/Block';

const ContactBlock = ({
  block,
}) => {
  return <Block title={_('contact')} icon="mail">
    <a className="block-contact-link" style={{ color: 'inherit' }} href={ block.url }>
      { block.url.replace('mailto:', '') }
    </a>
  </Block>;
};

export default ContactBlock;
