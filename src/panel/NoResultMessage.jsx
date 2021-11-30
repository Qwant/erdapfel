import React from 'react';
import { useI18n } from 'src/hooks';
import { Button, IconExternalLink } from '@qwant/qwant-ponents';

const NoResultMessage = () => {
  const { getLocalizedUrl, _ } = useI18n();
  const helpCenterLink = getLocalizedUrl('helpEditData');

  return (
    <>
      <p
        className="u-center u-mb-xs u-text--smallTitle"
        dangerouslySetInnerHTML={{
          __html: _('Sorry, we could not find this place&nbsp;🏝️', 'suggest'),
        }}
      />
      <p className="u-center u-text--subtitle">
        {_(
          'Please try to correct your query or rewrite it with more details about the location (city, country, …)',
          'suggest'
        )}
      </p>
      <p className="u-center">
        <Button
          href={helpCenterLink}
          variant="tertiary"
          onMouseDown={() => window.open(helpCenterLink)}
        >
          <IconExternalLink /> {_('Add a missing place on the map')}
        </Button>
      </p>
    </>
  );
};

export default NoResultMessage;
