/* global _ */
import React from 'react';
import OsmSchedule from 'src/adapters/osm_schedule';
import TimeTable from './TimeTable';
import PropTypes from 'prop-types';
import covidStrings from './covid_strings';

function renderTitle(opening, covid19) {
  if (covid19) {
    return <span>{covidStrings.seeNormalHours}</span>;
  }

  let text = `${_(opening.status.msg)} `;
  if (opening.nextTransition) {
    text += ' - ' +
      _('until {nextTransitionTime}', 'hour panel',
        { nextTransitionTime: opening.nextTransition }) + ' ';
  }
  return <span>{ text }
    <div className="poi_panel__info__hour__circle" style={{ background: opening.status.color }} />
  </span>;
}

export default class HourBlock extends React.Component {
  static propTypes = {
    block: PropTypes.object,
    covid19enabled: PropTypes.bool,
  }

  render() {
    const opening = new OsmSchedule(this.props.block);
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
