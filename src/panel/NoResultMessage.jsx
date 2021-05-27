/* globals _ */
import React from 'react';

const NoResultMessage = () => {
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
    </>
  );
};

export default NoResultMessage;
