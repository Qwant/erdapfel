import React, { useState } from 'react';
import Alert from './ui/Alert';
import { Button } from './ui';
import { get, set } from 'src/adapters/store';
import { parseQueryString } from '../libs/url_utils';
import { useI18n } from 'src/hooks';

const initialQueryParams = parseQueryString(window.location.search);

const BetaInfoBox = () => {
  const [closed, setClosed] = useState(get('beta_popup_closed'));
  const client = initialQueryParams['client'];
  const isUserFromSearch = client?.slice(0, 6) === 'search' || !!initialQueryParams['q'];
  const closeBetaPopup = () => {
    set('beta_popup_closed', 1);
    setClosed(true);
  };
  const { lang, _ } = useI18n();

  return (
    // Show beta popup if browser language is not french, if popup hasn't already been closed, and if the user comes from an IA
    lang !== 'fr' &&
    !closed &&
    isUserFromSearch && (
      <Alert
        title={_('Qwant Maps is in Beta!')}
        /* eslint-disable max-len */
        description={_(
          'This means that this version may have some bugs. We work very hard to improve Qwant Maps every day, while keeping your travels private.'
        )}
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
    )
  );
};

export default BetaInfoBox;
