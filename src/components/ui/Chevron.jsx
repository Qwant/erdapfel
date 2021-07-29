import React from 'react';
import { IconChevronDown } from 'src/components/ui/icons';
import { GREY_SEMI_DARKNESS } from 'src/libs/colors';

const Chevron = ({ up }) => (
  <IconChevronDown
    fill={GREY_SEMI_DARKNESS}
    style={{
      transition: 'transform .2s',
      transform: `rotate(${up ? 0 : 180}deg)`,
    }}
  />
);

export default Chevron;
