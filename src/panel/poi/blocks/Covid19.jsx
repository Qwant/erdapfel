/* globals _ */
import React, { Fragment } from 'react';
import nconf from '@qwant/nconf-getter';
import TimeTable from './TimeTable';
import OsmSchedule from 'src/adapters/osm_schedule';
import Telemetry from 'src/libs/telemetry';
import Button from 'src/components/ui/Button';

const covidConf = nconf.get().covid19;

const getContent = ({ status, opening_hours, note, contribute_url }) => {
  const additionalInfo = note &&
    <div className="covid19-note">
      <i className="icon-icon_info" />
      <p>{note}</p>
    </div>;

  const source = contribute_url &&
    <div className="covid19-source">
      Source&nbsp;:&nbsp;<a
        rel="noopener noreferrer"
        href="https://caresteouvert.fr"
        onClick={() => { Telemetry.add(Telemetry.COVID_CARESTEOUVERT_LINK); }}
      >
        caresteouvert.fr
      </a>
      <div className="u-center">
        <Button
          className="covid19-contributeLink"
          rel="noopener noreferrer"
          href={contribute_url}
          onClick={() => { Telemetry.add(Telemetry.COVID_CARESTEOUVERT_CONTRIBUTE); }}
        >
          {_('Report a change', 'covid19')}
        </Button>
      </div>
    </div>;

  let content;
  let schedule;
  switch (status) {
  case 'open':
  case 'open_as_usual':
    schedule = opening_hours && new OsmSchedule(opening_hours);
    content = <Fragment>
      {schedule && <div className="covid19-timeTableContainer">
        <i className="icon-icon_clock" />
        <TimeTable schedule={schedule} />
      </div>}
      {!schedule &&
        <div className="covid19-changeWarning">
          {_('Schedules subject to change', 'covid19')}
        </div>
      }
      {additionalInfo}
      {source}
    </Fragment>;
    break;
  case 'maybe_open':
    content = <Fragment>
      {additionalInfo}
      {source}
    </Fragment>;
    break;
  case 'closed':
  default:
    content = source;
  }

  return content;
};

/* eslint-disable */
const LocalizedWarning = ({ countryCode }) => {
  const warnings = {
    'FR': (
      <div>
        <p>
          {_('During the entire period of containment, movement to this location is only permitted with an overriding movement certificate.', 'covid19')}
        </p>
        <p>
          {_('More information at', 'covid19')}
          <a rel="noopener noreferrer" href={covidConf.frInformationUrl}> interieur.gouv.fr</a>
        </p>
      </div>
    ),
    'default': (
      <div>
        <p>
          {_('Please comply with government travel restrictions.', 'covid19')}
        </p>
      </div>
    )
  };

  return warnings[countryCode] || warnings['default']
}

const LegalWarning = ({ countryCode }) => (
  <div className="covid19-legalWarning">
    <i className="icon-alert-triangle" />
    <LocalizedWarning countryCode={countryCode} />
  </div>
)

const Status = ({ status }) => {
  const statusMessages = {
    open: _('Opened during containment', 'covid19'),
    open_as_usual: _('Opened during containment', 'covid19'),
    maybe_open: _('Potentially opened during containment'),
    closed: _('Closed during containment', 'covid19'),
    unknown: _('No information on opening during containment', 'covid19'),
  };

  return (
    <h4 className="poi_panel__sub_block__title">
      <span className="covid19-tag">Covid-19</span>
      {statusMessages[status] || statusMessages['unknown']}
    </h4>
  )
}

const Covid19 = ({ block, poi }) => {
  return <div className="poi_panel__info__section covid19">
    <Status status={block.status} />
    {getContent(block)}
    <LegalWarning countryCode={poi.address.country_code} />
  </div>;
};
/* eslint-enable */

export default Covid19;
