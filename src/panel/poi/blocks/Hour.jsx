/* global _ */
import React from 'react';
import OsmSchedule from 'src/adapters/osm_schedule';
import TimeTable from './TimeTable';
import PropTypes from 'prop-types';

function renderTitle(opening, covid19) {
  if (covid19) {
    return <span className="poi_panel__info__hours__status__text">
      Voir les horaires habituels
    </span>;
  }

  let text = `${_(opening.status.msg)} `;
  if (opening.nextTransition) {
    text += ' - ' +
      _('until {nextTransitionTime}', 'hour panel',
        { nextTransitionTime: opening.nextTransition }) + ' ';
  }
  return <span className="poi_panel__info__hours__status__text">{ text }
    <div className="poi_panel__info__hour__circle" style={{ background: opening.status.color }} />
  </span>;
}

export default class HourBlock extends React.Component {
  static propTypes = {
    block: PropTypes.object,
    covid19enabled: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.messages = {
      open: {
        msg: _('Open'),
        color: '#60ad51',
      },
      closed: {
        msg: _('Closed'),
        color: '#8c0212',
      },
    };
  }

  render() {
    const opening = new OsmSchedule(this.props.block, this.messages);
    if (!opening.days) {
      return null;
    }

    return <div className="poi_panel__info__section poi_panel__info__section--hours">
      <div className="poi_panel__info__section__description">
        <div className="icon-icon_clock poi_panel__block__symbol"></div>
        <div className="poi_panel__block__content">
          <TimeTable title={renderTitle(opening, this.props.covid19enabled)} schedule={opening} />
        </div>
      </div>
    </div>;
  }
}
