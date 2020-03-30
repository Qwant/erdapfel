import React, { Fragment } from 'react';

const strings = {
  blockTitle: 'Informations spéciales confinement',
  linkToCaResteOuvert: 'Signaler un changement',
  statusOpen: 'Ouvert',
  statusMaybeOpen: 'Susceptible d\'être ouvert',
  statusClosed: 'Fermé',
  statusNoData: 'Pas d\'information renseignée',
  hoursMayChange: 'Horaires susceptibles d\'être adaptés',
};

const getContent = ({ status, contribute_url, note }) => {
  const additionalInfo = note &&
    <div className="covid19-note" dangerouslySetInnerHTML={{ __html: note }}/>;

  const contributeLink =
    <a className="covid19-contributeLink" href={contribute_url}>
      {strings.linkToCaResteOuvert}
    </a>;

  let content = null;
  switch (status) {
  case 'open':
  case 'open_as_usual':
    content = <Fragment>
      <span className="covid19-status covid19-status--open">{strings.statusOpen}</span>
      {additionalInfo}
      {contributeLink}
    </Fragment>;
    break;
  case 'maybe_open':
    content = <Fragment>
      <span className="covid19-status covid19-status--maybeOpen">{strings.statusMaybeOpen}</span>
      <span className="covid19-changeWarning">{strings.hoursMayChange}</span>
      {additionalInfo}
      {contributeLink}
    </Fragment>;
    break;
  case 'closed':
    content = <span className="covid19-status covid19-status--closed">{strings.statusClosed}</span>;
    break;
  default:
    content = <span>{strings.statusNoData}</span>;
  }

  return content;
};

const Covid19 = ({ block }) => {
  return <div className="poi_panel__info__section covid19">
    <h4 className="poi_panel__sub_block__title">{strings.blockTitle}</h4>
    {getContent(block)}
  </div>;
};

export default Covid19;
