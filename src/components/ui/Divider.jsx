import React from 'react';

import Flex from 'src/components/ui/Flex';

const Divider = ({ dx = 0, dy = 20 }) =>
  <Flex
    className="divider"
    justifyContent="center"
    style={{
      padding: `${dy}px 0`,
    }}
  >
    <div
      className="divider-line"
      style={{
        width: `calc(100% - ${dx}px)`,
      }} />
  </Flex>
;

export default Divider;
