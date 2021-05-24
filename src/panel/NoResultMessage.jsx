/* globals _ */
import React from 'react';

const NoResultMessage = () => {
  return (
    <>
      <p className="u-center u-mb-xs u-text--smallTitle">
        {_('Sorry, we could not find this place 🏝️', 'suggest')}
      </p>
      <p className="u-center u-text--subtitle u-mb-l">
        {_(
          'Please try to correct your query or rewrite it with more details about the location (city, country, ...)',
          'suggest'
        )}
      </p>
    </>
  );
};

export default NoResultMessage;
