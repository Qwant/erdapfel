import React from 'react';
import { Flex, Divider } from '.';

const PanelNav = ({ children }) =>
  <div className="panelNav">
    <Flex className="panelNav-content" justifyContent="space-between">
      {children}
    </Flex>

    <Divider
      paddingTop={0}
      paddingBottom={0}
    />
  </div>
;

export default PanelNav;
