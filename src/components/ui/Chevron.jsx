import React from 'react';
import { IconArrowDownSLine } from '@qwant/qwant-ponents';
import { GREY_SEMI_DARKNESS } from 'src/libs/colors';

const Chevron = ({ up, fill = GREY_SEMI_DARKNESS, size = 24 }) => (
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
