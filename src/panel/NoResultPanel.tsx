/* globals _ */
import React from 'react';
import { Panel } from 'src/components/ui';
import NoResultMessage from './NoResultMessage';
import { Flex, Stack } from '@qwant/qwant-ponents';

const close = () => window.app.navigateTo('/');

type NoResultPanelProps = {
  resetInput?: () => void;
};

const NoResultPanel: React.FunctionComponent<NoResultPanelProps> = ({ resetInput }) => {
  const tryNewSearch = () => {
    close();
    resetInput?.();
  };

  return (
    <Panel close={close} fitContent={['default']}>
      <Stack alignCenter gap="xs" py="l" px="xl2">
        <NoResultMessage />
        <Flex mt="xs" center>
          <a onClick={tryNewSearch} href="#">
            {_('Try a new search query')}
          </a>
        </Flex>
      </Stack>
    </Panel>
  );
};

export default NoResultPanel;
