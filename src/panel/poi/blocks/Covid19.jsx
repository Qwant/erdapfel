import React, { Fragment } from 'react';
import nconf from '@qwant/nconf-getter';
import TimeTable from './TimeTable';
import covidStrings from './covid_strings';
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
          {covidStrings.linkToCaResteOuvert}
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
      {!schedule && <div className="covid19-changeWarning">{covidStrings.hoursMayChange}</div>}
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

const statusMessages = {
  open: covidStrings.statusOpen,
  open_as_usual: covidStrings.statusOpen,
  maybe_open: covidStrings.statusMaybeOpen,
  closed: covidStrings.statusClosed,
  unknown: covidStrings.statusNoData,
};

/* eslint-disable */
const localizedWarnings = {
  'FR': (
    <div>
      <p>
        Pendant toute la période de confinement, se déplacer vers ce lieu n'est autorisé
        qu'en possession d'une attestation de déplacement dérogatoire.
      </p>
      <p>
        Plus d'informations sur{' '}
        <a rel="noopener noreferrer" href={covidConf.frInformationUrl}>interieur.gouv.fr</a>
      </p>
    </div>
  ),
  'default': (
    <div>
      <p>
        Respectez les restrictions gouvernementales liées aux déplacements.
      </p>
    </div>
  )
};

const LegalWarning = ({ countryCode }) => (
  <div className="covid19-legalWarning">
    <i className="icon-alert-triangle" />
    {localizedWarnings[countryCode] || localizedWarnings['default']}
  </div>
)

const Covid19 = ({ block, poi }) => {
  const statusMsg = statusMessages[block.status] || statusMessages['unknown'];

  return <div className="poi_panel__info__section covid19">
    <h4 className="poi_panel__sub_block__title">
      <span className="covid19-tag">Covid-19</span>{statusMsg}
    </h4>
    {getContent(block)}
    <LegalWarning countryCode={poi.address.country_code} />
  </div>;
};
/* eslint-enable */

export default Covid19;
