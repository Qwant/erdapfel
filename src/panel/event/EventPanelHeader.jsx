/* global _ */
import React from 'react';
import { sources } from 'config/constants.yml';

const EventPanelHeader = ({ dataSource }) => {
  if (dataSource === sources.pagesjaunes) {
    return <div className="event__panel__partner">
      <div className="event__panel__partner_title">
        {_('PARTNER NAME', 'events')}
      </div>
      <div className="event__panel__event_partnership">
        {_('Partnership', 'events')}
      </div>
    </div>;
  }

  return '';
};

export default EventPanelHeader;
