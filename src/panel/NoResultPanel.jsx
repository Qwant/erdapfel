/* globals _ */
import React from 'react';
import { Panel } from 'src/components/ui';
import NoResultMessage from './NoResultMessage';

const close = () => window.app.navigateTo('/');

const NoResultPanel = () => {
  return (
    <Panel close={close}>
      <div style={{ padding: '16px 16px 32px 16px' }}>
        <NoResultMessage />
        <a href="#">{_('Add a missing place on the map', 'suggest')}</a>
      </div>
    </Panel>
  );
};

export default NoResultPanel;
