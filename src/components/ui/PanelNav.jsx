import React from 'react';
import { Divider } from '.';
import { Flex } from '@qwant/qwant-ponents';

const PanelNav = ({ children }) => (
  <div>
    <Flex px="xxs" my="xs" between>
      {children}
    </Flex>
    <Divider paddingTop={0} paddingBottom={0} />
  </div>
);
export default PanelNav;
