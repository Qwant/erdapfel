import React from 'react';
import { IconArrowDownSLine } from '@qwant/qwant-ponents';
import { GREY_SEMI_DARKNESS } from 'src/libs/colors';

type ChevronProps = {
  up?: boolean;
  fill?: string;
  size?: number;
};

const Chevron = ({ up = false, fill = GREY_SEMI_DARKNESS, size = 24 }: ChevronProps) => (
  <IconArrowDownSLine
    size={size}
    fill={fill}
    style={{
      transition: 'transform .2s',
      transform: `rotate(${up ? 180 : 0}deg)`,
    }}
  />
);

export default Chevron;
