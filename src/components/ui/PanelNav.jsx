import React from 'react';
import { Button, Flex, Divider } from '.';

const PanelNav = ({ onGoBack, goBackText }) =>
  <div className="panelNav">
    <Flex className="panelNav-content" justifyContent="space-between">
      <Button
        icon="arrow-left"
        variant="tertiary"
        onClick={onGoBack}
      >
        {goBackText}
      </Button>
    </Flex>

    <Divider
      paddingTop={0}
      paddingBottom={0}
    />
  </div>
;

export default PanelNav;
