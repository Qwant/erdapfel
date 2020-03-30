/* global _ */
import React from 'react';
import OsmSchedule from 'src/adapters/osm_schedule';
import classnames from 'classnames';
import PropTypes from 'prop-types';

function showHour(day) {
  if (day.opening && day.opening.length > 0) {
    return day.opening.map((openingFragment, i) =>
      <p key={i}>{ openingFragment.beginning } - { openingFragment.end }</p>);
  }
  return _('Closed', 'hour block');
}

function showHours(displayHours) {
  const dayNumber = new Date().getDay();

  return <tbody>
    {displayHours.map((day, i) =>
      <tr key={i} className={
        classnames({ 'poi_panel__info__hours--current': (i + 1) % 7 === dayNumber })
      }>
        <td className="day">{ day.dayName }</td>
        <td className="hours">{ showHour(day) }</td>
      </tr>)}
  </tbody>;
}

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
    this.state = { isCollapsed: true };

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

    this.expandCollapse = () => {
      this.setState(state => ({
        isCollapsed: !state.isCollapsed,
      }));
    };
  }

  renderStatus(opening) {
    // TODO: use OpeningHour instead (careful! OsmSchedule initialization happens there as well!)
    if (opening.isTwentyFourSeven) {
      return <div className="poi_panel__info__hours__status__text poi_panel__info__hours__24_7">
        { _('Open 24/7', 'hour block') }
        <div className="poi_panel__info__hour__circle"
          style={{ background: opening.status.color }}
        />
      </div>;
    }
    return <div>
      <div className="poi_panel__info__hours__status" onClick={this.expandCollapse}>
        { renderTitle(opening, this.props.covid19enabled) }
        <i className={classnames(
          'icon-icon_chevron-down',
          'poi_panel__info__hours__status__toggle',
          {
            'poi_panel__info__hours__status__toggle--reversed': !this.state.isCollapsed,
          })} />
      </div>
      <div className={classnames('poi_panel__info__hours', {
        'poi_panel__info__hours--open': !this.state.isCollapsed,
      })}>
        <table className="poi_panel__info__hours__table">
          { showHours(opening.displayHours) }
        </table>
      </div>
    </div>;
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
          { this.renderStatus(opening) }
        </div>
      </div>
    </div>;
  }
}
