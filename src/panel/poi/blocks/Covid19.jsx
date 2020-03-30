import React, { Fragment } from 'react';
import TimeTable from './TimeTable';
import covidStrings from './covid_strings';
import OsmSchedule from 'src/adapters/osm_schedule';
import OpeningHour from 'src/components/OpeningHour';

// @TODO: refacto OsmSchedule so it doesn't need presentational data
const scheduleMessages = {
  open: {
    msg: 'Ouvert',
    color: '#60ad51',
  },
  closed: {
    msg: 'Fermé',
    color: '#8c0212',
  },
};

const getContent = (poi, { status, opening_hours, note, contribute_url }) => {
  const additionalInfo = note &&
    <div className="covid19-note">
      <i className="icon-icon_info" />
      {note}
    </div>;

  const source = contribute_url &&
    <div className="covid19-source">
      <div>Source&nbsp;:&nbsp;
        <a href="https://caresteouvert.fr">Ça reste ouvert</a>
      </div>
      <a className="covid19-contributeLink" href={contribute_url}>
        {covidStrings.linkToCaResteOuvert}
      </a>
    </div>;

  let content;
  let schedule;
  switch (status) {
  case 'open':
  case 'open_as_usual':
    schedule = opening_hours && new OsmSchedule(opening_hours, scheduleMessages);
    content = <Fragment>
      <div className="covid19-status covid19-status--open">{covidStrings.statusOpen}</div>
      {schedule && <div className="covid19-timeTableContainer">
        <i className="icon-icon_clock" />
        <TimeTable title={<OpeningHour poi={poi} />} schedule={schedule} />
      </div>}
      {!schedule && <div className="covid19-changeWarning">{covidStrings.hoursMayChange}</div>}
      {additionalInfo}
      {source}
    </Fragment>;
    break;
  case 'maybe_open':
    content = <Fragment>
      <div className="covid19-status covid19-status--maybeOpen">
        {covidStrings.statusMaybeOpen}
      </div>
      <div className="covid19-changeWarning">{covidStrings.hoursMayChange}</div>
      {additionalInfo}
      {source}
    </Fragment>;
    break;
  case 'closed':
    content = <Fragment>
      <div className="covid19-status covid19-status--closed">
        {covidStrings.statusClosed}
      </div>
      {source}
    </Fragment>;
    break;
  default:
    content = <Fragment>
      <span>{covidStrings.statusNoData}</span>
      {source}
    </Fragment>;
  }

  return content;
};

const Covid19 = ({ poi, block }) => {
  return <div className="poi_panel__info__section covid19">
    <h4 className="poi_panel__sub_block__title">{covidStrings.blockTitle}</h4>
    {getContent(poi, block)}
  </div>;
};

export default Covid19;
