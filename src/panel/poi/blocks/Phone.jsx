import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Block from 'src/panel/poi/blocks/Block';
import { isFromPagesJaunes } from 'src/libs/pois';
import { useDevice, useI18n } from 'src/hooks';

const PhoneBlock = ({ block, poi }) => {
  const { _ } = useI18n();
  const { isMobile } = useDevice();
  const [isHidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(!isMobile && isFromPagesJaunes(poi));
  }, [poi, isMobile]);

  const onClick = () => {
    if (isHidden) {
      setHidden(false);
    } else {
      window.open(`${block.url}`, '_self');
    }
  };

  return (
    <Block
      className="block-phone"
      icon="icon_phone"
      title={_('phone')}
      onClick={isHidden ? onClick : null}
      href={isHidden ? null : block.url}
    >
      {isHidden ? _('Show the number') : block.local_format}
    </Block>
  );
};

PhoneBlock.propTypes = {
  block: PropTypes.object,
};

export default PhoneBlock;
