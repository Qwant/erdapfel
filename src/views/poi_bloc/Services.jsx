/* global _ */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AccessibilityBlock from '../../views/poi_bloc/Accessibility';
import BreweryBlock from '../../views/poi_bloc/Brewery';
import InternetAccessBlock from '../../views/poi_bloc/InternetAccess';

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
      return _('Services & information');
    }
    const { accessibility, internetAccess, brewery } = this.props;
    return <div>
      {accessibility && <AccessibilityBlock block={accessibility} asString/>}
      {accessibility && internetAccess && ' - '}
      {internetAccess && <InternetAccessBlock block={internetAccess} asString/>}
      {internetAccess && brewery && ' - '}
      {brewery && <BreweryBlock block={brewery} asString/>}
    </div>;
  }

  render() {
    const { accessibility, internetAccess, brewery } = this.props;

    if (!accessibility && !internetAccess && !brewery) {
      return null;
    }

    return <Fragment>
      <div className="poi_panel__sub_block__title" onClick={this.expandCollapse}>
        <h4 className="poi_panel__sub_block__title__text">{this.getTitle()}</h4>
        <div className={
          classnames('poi_panel__block__collapse', 'icon-icon_chevron-down', {
            'poi_panel__block__collapse--reversed': !this.state.isCollapsed,
          })} />
      </div>
      {!this.state.isCollapsed && <div className="poi_panel__service_information__container">
        {accessibility && <AccessibilityBlock block={accessibility} />}
        {internetAccess && <InternetAccessBlock block={internetAccess} />}
        {brewery && <BreweryBlock block={brewery} />}
      </div>}
    </Fragment>;
  }
}
