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
    <Panel close={close} fitContent={['default']}>
      <div style={{ padding: '20px 34px' }}>
        <NoResultMessage />
        <p className="u-center u-mt-s">
          <a onClick={tryNewSearch} href="#">
            {_('Try a new search query')}
          </a>
        </p>
      </div>
    </Panel>
  );
};

export default NoResultPanel;
