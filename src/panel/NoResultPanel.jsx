/* globals _ */
import React from 'react';
import { Panel } from 'src/components/ui';

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
        <p className="u-mb-xs u-text--smallTitle">{_('No results found.')}</p>
        <p className="u-text--subtitle u-mb-l">
          {_('Check the spelling of your search or add more details, such as city or country.')}
        </p>
        <a onClick={tryNewSearch} href="#">
          {_('Try a new search query')}
        </a>
      </div>
    </Panel>
  );
};

export default NoResultPanel;
