import React, { useCallback, useState } from 'react';
import Block from 'src/panel/poi/blocks/Block';
import { IconPhone } from '@qwant/qwant-ponents';
import { ACTION_BLUE_BASE } from 'src/libs/colors';
import { components } from 'appTypes/idunn';

export type PoiPhoneBlockProps = {
  texts?: {
    show_the_number: string;
    phone: string;
  };
  block: components['schemas']['PhoneBlock'];
  isDefaultHidden?: boolean;
  onBlockClick?: () => void;
};

const PhoneBlock: React.FunctionComponent<PoiPhoneBlockProps> = ({
  block,
  texts,
  isDefaultHidden,
  onBlockClick,
}) => {
  const [isHidden, setHidden] = useState(isDefaultHidden);

  const onBlockPhoneClick = useCallback(() => {
    if (isHidden) {
      setHidden(false);
    }
    onBlockClick?.();
  }, [isHidden, onBlockClick]);

  return (
    <Block
      className="block-phone"
      icon={<IconPhone size={20} fill={ACTION_BLUE_BASE} />}
      title={texts?.phone}
      onClick={onBlockPhoneClick}
      {...(!isHidden ? { href: block?.url } : {})}
    >
      {isHidden ? texts?.show_the_number : block?.local_format}
    </Block>
  );
};

export default PhoneBlock;
