import React from 'react';
import OsmSchedule from 'src/adapters/osm_schedule';
import TimeTable from './TimeTable';
import PropTypes from 'prop-types';
import covidStrings from './covid_strings';
import OpeningHour from 'src/components/OpeningHour';

export default class HourBlock extends React.Component {
  static propTypes = {
    block: PropTypes.object,
    covid19enabled: PropTypes.bool,
  }

  render() {
    const schedule = new OsmSchedule(this.props.block);
    if (!schedule.days) {
      return null;
    }

    const timeTableTitle = this.props.covid19enabled
      ? <span>{covidStrings.seeNormalHours}</span>
      : <OpeningHour schedule={schedule} />;

    return <div className="poi_panel__info__section poi_panel__info__section--hours">
      <div className="poi_panel__info__section__description">
        <div className="icon-icon_clock poi_panel__block__symbol"></div>
        <div className="poi_panel__block__content">
          <TimeTable schedule={schedule} title={timeTableTitle} />
        </div>
      </div>
    </div>;
  }
}
