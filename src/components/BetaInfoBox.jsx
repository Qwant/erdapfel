/* global _ */
import React, { useState } from 'react';
import Alert from './ui/Alert';
import { Button } from './ui';
import { get, set } from 'src/adapters/store';
import { parseQueryString } from '../libs/url_utils';

const initialQueryParams = parseQueryString(window.location.search);

const BetaInfoBox = () => {
  const [closed, setClosed] = useState(get('beta_popup_closed'));
  const [client] = useState(initialQueryParams['client']);
  const closeBetaPopup = () => {
    set('beta_popup_closed', 1);
    setClosed(true);
  };

  return (
    // Show beta popup if browser language is not french, if popup hasn't already been closed, and if the user comes from an IA
    window.getLang().code.indexOf('fr') === -1
    && !closed
    && client === 'search-ia-local'
    &&
    <Alert
      title={_('Qwant Maps is in Beta!')}
      /* eslint-disable max-len */
      description={_('This means that this version may have some bugs. We work very hard to improve Qwant Maps every day, while keeping your travels private.')}
      /* eslint-enable max-len */
      type="info"
      onClose={closeBetaPopup}
      footer={
        <div className="alert-link">
          <Button variant="tertiary" onClick={closeBetaPopup}>
            {_('Do not display this message again')}
          </Button>
        </div>
      }
    />
  );
};

export default BetaInfoBox;

