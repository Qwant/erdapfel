/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';

import Block from 'src/components/ui/Block';

const PhoneBlock = ({ block }) =>
  <Block className="block-phone" icon="icon_phone" title={_('Phone')}>
    <a style={{ color: 'inherit' }} href={block.url}>{block.local_format}</a>
  </Block>
;

PhoneBlock.propTypes = {
  block: PropTypes.object,
};

export default PhoneBlock;
