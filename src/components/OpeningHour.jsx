/* global _ */
import React from 'react';
import classnames from 'classnames';

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

  if (isTwentyFourSeven && !showNextOpenOnly) {
    return <div className="openingHour poi_panel__info__hours__24_7">
      {_('Open 24/7', 'hour block')}
      {' '}
      <div className="openingHour-circle" style={{ background: color }} />
    </div>;
  }

  const NextTransition = () => {
    if (!nextTransition || showNextOpenOnly && status !== 'closed') {
      return null;
    }

    const options = { nextTransitionTime: nextTransition };

    const text = status === 'closed'
      ? ` - ${_('reopening at {nextTransitionTime}', 'hour panel', options)}`
      : ` - ${_('until {nextTransitionTime}', 'hour panel', options)}`;

    return text;
  };

  return <div className={classnames('openingHour', className)}>
    {label}
    <NextTransition />
    {' '}
    <div className="openingHour-circle" style={{ background: color }} />
  </div>;
};

export default OpeningHour;
