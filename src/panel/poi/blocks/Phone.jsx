import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Block from 'src/panel/poi/blocks/Block';
import Telemetry from 'src/libs/telemetry';
import { isFromPagesJaunes } from 'src/libs/pois';
import { useDevice, useI18n } from 'src/hooks';
import { IconPhone } from '@qwant/qwant-ponents';
import { ACTION_BLUE_BASE } from 'src/libs/colors';

const PhoneBlock = ({ block, poi }) => {
  const { _ } = useI18n();
  const { isMobile } = useDevice();
  const [isHidden, setHidden] = useState(!isMobile && isFromPagesJaunes(poi));

  useEffect(() => {
    setHidden(!isMobile && isFromPagesJaunes(poi));
  }, [poi, isMobile]);

  const sendEvent = () => {
    Telemetry.sendPoiEvent(
      poi,
      'phone',
      Telemetry.buildInteractionData({
        id: poi.id,
        source: poi.meta?.source,
        template: 'single',
        zone: 'detail',
        element: 'phone',
      })
    );
  };

  const revealNumber = () => {
    setHidden(false);
    sendEvent();
  };

  return (
    <Block
      className="block-phone"
      icon={<IconPhone size={20} fill={ACTION_BLUE_BASE} />}
      title={_('phone')}
      onClick={isHidden ? revealNumber : sendEvent}
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
