/* global _ */
import React, { useState } from 'react';
import { Notification } from './ui';
import { get, set } from 'src/adapters/store';

const AddToHomeInfoBox = () => {
  const [closed, setClosed] = useState(get('add_to_home_closed'));
  const closeBetaPopup = () => {
    set('add_to_home_closed', 1);
    setClosed(true);
  };

  const visits = parseInt(get('visits') || 0) + 1;
  set('visits', visits);

  return (
    // Show popup on mobile, at the fifth visit, if it hasn't already been closed
    visits >= 5 &&
    !closed && (
      <Notification
        title={_('Psst, do you come here often ?')}
        description={_('Add a Qwant Maps shortcut to your Home screen !')}
        type="info"
        onClose={closeBetaPopup}
        footer={
          <div className="notification-link">
            <a href="#">{_('Follow the guide to add the shortcut')}</a>
          </div>
        }
      />
    )
  );
};

export default AddToHomeInfoBox;
