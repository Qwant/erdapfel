/* global _ */
import React from 'react';
import classnames from 'classnames';
import { capitalizeFirst } from 'src/libs/string';

const getStatusMessage = status => {
  if (status === 'open') {
    return {
      label: _('Open'),
      color: '#5d9836',
    };
  }

  if (status === 'closed') {
    return {
      label: _('Closed'),
      color: '#900014',
    };
  }

  return { label: '', color: '#fff' };
};

const OpeningHour = ({ schedule, showNextOpenOnly = false, withIcon, className }) => {
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

  return <span
    className={classnames(
      'openingHour',
      'u-text--subtitle',
      {
        [`openingHour--${status}`]: status,
        'openingHour--24-7': isTwentyFourSeven,
      }, className
    )}
    style={{ color }}
  >
    {withIcon && <i className="icon-icon_clock u-mr-xxs"/>}
    {getDescription()}
  </span>;
};

export default OpeningHour;
