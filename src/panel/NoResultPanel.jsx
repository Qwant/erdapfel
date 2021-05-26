/* globals _ */
import React from 'react';
import { Panel } from 'src/components/ui';
import NoResultMessage from './NoResultMessage';

const close = () => window.app.navigateTo('/');

const NoResultPanel = ({ resetInput }) => {
  const tryNewSearch = e => {
    e.preventDefault();
    close();
    resetInput();
  };

  return (
    <Panel close={close}>
      <div style={{ padding: '16px 16px 32px 16px' }}>
        <NoResultMessage />
        <p className="u-center">
          <a onClick={tryNewSearch} href="#">
            {_('Try a new search query')}
          </a>
        </p>
      </div>
    </Panel>
  );
};

export default NoResultPanel;
