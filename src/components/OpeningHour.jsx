/* global _ */
import React from 'react';

const getStatusMessage = status => {
  if (status === 'open') {
    return {
      label: _('Open'),
      color: '#60ad51',
    };
  }

  if (status === 'closed') {
    return {
      label: _('Closed'),
      color: '#8c0212',
    };
  }

  return { label: '', color: '#fff' };
};

const OpeningHour = ({ schedule, showNextOpenOnly = false }) => {
  if (!schedule) {
    return null;
  }

  const { isTwentyFourSeven, status, nextTransition } = schedule;
  const { label, color } = getStatusMessage(status);

  if (isTwentyFourSeven && !showNextOpenOnly) {
    return <div className="openingHour poi_panel__info__hours__24_7">
      {_('Open 24/7', 'hour block')}
      {' '}
      <div className="openingHour-circle" style={{ background: color }} />
    </div>;
  }

  return <div className="openingHour u-text--label">
    {label}
    {(nextTransition &&
     (!showNextOpenOnly || showNextOpenOnly && status === 'closed')) &&
    ` - ${_('until {nextTransitionTime}', 'hour panel', { nextTransitionTime: nextTransition })}`
    }
    {' '}
    <div className="openingHour-circle" style={{ background: color }} />
  </div>;
};

export default OpeningHour;
