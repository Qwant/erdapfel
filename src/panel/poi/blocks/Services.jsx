import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AccessibilityBlock from './Accessibility';
import BreweryBlock from './Brewery';
import InternetAccessBlock from './InternetAccess';

const Services = ({ accessibility, internetAccess, brewery }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const getTitle = () => {
    if (!isCollapsed) {
      return '';
    }

    return (
      <span>
        {accessibility && <AccessibilityBlock block={accessibility} asString />}
        {accessibility && internetAccess && ' - '}
        {internetAccess && <InternetAccessBlock block={internetAccess} asString />}
        {internetAccess && brewery && ' - '}
        {brewery && <BreweryBlock block={brewery} asString />}
      </span>
    );
  };

  if (!accessibility && !internetAccess && !brewery) {
    return null;
  }

  return (
    <Fragment>
      <span
        className="poi_panel__sub_block__title"
        onClick={() => {
          setIsCollapsed(!isCollapsed);
        }}
      >
        {getTitle()}
        <i
          className={classnames('icon-icon_chevron-down', 'poi_panel__block__collapse', {
            'poi_panel__block__collapse--reversed': !isCollapsed,
          })}
        />
      </span>
      {!isCollapsed && (
        <div className="poi_panel__service_information__container">
          {accessibility && <AccessibilityBlock block={accessibility} />}
          {internetAccess && <InternetAccessBlock block={internetAccess} />}
          {brewery && <BreweryBlock block={brewery} />}
        </div>
      )}
    </Fragment>
  );
};

Services.propTypes = {
  accessibility: PropTypes.object,
  internetAccess: PropTypes.object,
  brewery: PropTypes.object,
};

export default Services;
