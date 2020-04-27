/* globals _ */
import React from 'react';
import OsmSchedule from 'src/adapters/osm_schedule';
import TimeTable from './TimeTable';
import PropTypes from 'prop-types';

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

    return <div className="poi_panel__info__section poi_panel__info__section--hours">
      <div className="poi_panel__info__section__description">
        <div className="icon-icon_clock poi_panel__block__symbol"></div>
        <div className="poi_panel__block__content">
          <TimeTable
            schedule={schedule}
            title={this.props.covid19enabled && _('See the usual opening hours', 'covid19')}
          />
        </div>
      </div>
    </div>;
  }
}
