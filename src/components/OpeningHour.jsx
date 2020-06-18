/* global _ */
import React from 'react';
import classnames from 'classnames';
import { capitalizeFirst } from 'src/libs/string';

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

const OpeningHour = ({ schedule, showNextOpenOnly = false, className }) => {
  if (!schedule) {
    return null;
  }

  const { isTwentyFourSeven, status, nextTransition } = schedule;
  const { label, color } = getStatusMessage(status);

  const getDescription = () => {
    if (isTwentyFourSeven && !showNextOpenOnly) {
      return _('Open 24/7', 'hour block');
    }

    const parts = [];

    if (!nextTransition || status !== 'closed' || !showNextOpenOnly) {
      parts.push(label);
    }

    if (nextTransition && (status === 'closed' || !showNextOpenOnly)) {
      const options = { nextTransitionTime: nextTransition };
      parts.push(status === 'closed'
        ? _('reopening at {nextTransitionTime}', 'hour panel', options)
        : _('until {nextTransitionTime}', 'hour panel', options));
    }

    return capitalizeFirst(parts.join(' - '));
  };

  return <div className={classnames('openingHour', {
    [`openingHour--${status}`]: status,
    'openingHour--24-7': isTwentyFourSeven,
  }, className)}>
    <div>{getDescription()}</div>
    <div className="openingHour-circle u-ml-4" style={{ background: color }} />
  </div>;
};

export default OpeningHour;
