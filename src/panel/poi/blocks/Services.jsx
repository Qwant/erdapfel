import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AccessibilityBlock from './Accessibility';
import BreweryBlock from './Brewery';
import InternetAccessBlock from './InternetAccess';

export default class Services extends React.Component {
  static propTypes = {
    accessibility: PropTypes.object,
    internetAccess: PropTypes.object,
    brewery: PropTypes.object,
  }

  state = {
    isCollapsed: true,
  };

  expandCollapse = () => {
    this.setState(state => ({
      isCollapsed: !state.isCollapsed,
    }));
  };


  getTitle() {
    if (!this.state.isCollapsed) {
      return '';
    }

    const { accessibility, internetAccess, brewery } = this.props;
    return <span>
      {accessibility && <AccessibilityBlock block={accessibility} asString/>}
      {accessibility && internetAccess && ' - '}
      {internetAccess && <InternetAccessBlock block={internetAccess} asString/>}
      {internetAccess && brewery && ' - '}
      {brewery && <BreweryBlock block={brewery} asString/>}
    </span>;
  }

  render() {
    const { accessibility, internetAccess, brewery } = this.props;

    if (!accessibility && !internetAccess && !brewery) {
      return null;
    }

    return <Fragment>
      <span className="poi_panel__sub_block__title" onClick={this.expandCollapse}>
        {this.getTitle()}
        <i
          className={classnames(
            'icon-icon_chevron-down',
            'poi_panel__block__collapse',
            { 'poi_panel__block__collapse--reversed': !this.state.isCollapsed }
          )}
        />
      </span>
      {!this.state.isCollapsed && <div className="poi_panel__service_information__container">
        {accessibility && <AccessibilityBlock block={accessibility} />}
        {internetAccess && <InternetAccessBlock block={internetAccess} />}
        {brewery && <BreweryBlock block={brewery} />}
      </div>}
    </Fragment>;
  }
}
