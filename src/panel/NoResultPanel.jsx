import React from 'react';
import { Panel } from 'src/components/ui';
import NoResultMessage from './NoResultMessage';

const close = () => window.app.navigateTo('/');

const NoResultPanel = () => {
  return (
    <Panel close={close}>
      <div style={{ padding: '16px 16px 32px 16px' }}>
        <NoResultMessage />
      </div>
    </Panel>
  );
};

export default NoResultPanel;
