/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import Block from 'src/panel/poi/blocks/Block';

const PhoneBlock = ({ block }) => {
  return (
    <Block className="block-phone" icon="icon_phone" title={_('phone')} href={block.url}>
      {block.local_format}
    </Block>
  );
};

PhoneBlock.propTypes = {
  block: PropTypes.object,
};

export default PhoneBlock;
