/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class AccessibilityBlock extends React.Component {
  static propTypes = {
    block: PropTypes.object,
    asString: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = { isCollapsed: this.props.asString };

    this.labels = {
      'wheelchair': {
        'yes': 'Wheelchair accessible',
        'partial': 'Partially wheelchair accessible',
        'no': 'Not wheelchair accessible',
      },
      'toilets_wheelchair': {
        'yes': 'Wheelchair accessible toilets',
        'partial': 'Partial wheelchair accessible toilets',
        'no': 'No wheelchair accessible toilets',
      },
    };

    this.expandCollapse = this.expandCollapse.bind(this);
  }

  expandCollapse() {
    this.setState(state => ({
      isCollapsed: !state.isCollapsed,
    }));
  }

  renderTitle(title) {
    return <div className="poi_panel__sub_block__title" onClick={this.expandCollapse}>
      <h4 className="poi_panel__sub_block__title__text">{title}</h4>
      <div className={
        classnames('poi_panel__block__collapse', 'icon-icon_chevron-down', {
          'poi_panel__block__collapse--reversed': !this.state.isCollapsed,
        })} />
    </div>;
  }

  renderExpandedContent(availableAccessibilities) {
    return <div className="poi_panel__service_information__container">
      <div className="poi_panel__block__information poi_panel__block__information--extended">
        <h6 className="poi_panel__sub__sub_block__title">{ _('Accessibility', 'poi') }</h6>
        <ul className="poi_panel__info__accessibilities">
          {availableAccessibilities.map((a11y, index) => <li key={`i11y${index}`}>{a11y}</li>)}
        </ul>
      </div>
    </div>;
  }

  renderCollapsed(availableAccessibilities) {
    return this.renderTitle(availableAccessibilities.join('. '));
  }

  renderExpanded(availableAccessibilities) {
    return [
      this.renderTitle(_('Services & information')),
      this.renderExpandedContent(availableAccessibilities),
    ];
  }

  render() {
    const accessibilityList = this.props.block;
    const availableAccessibilities = [];
    for (const [label, elems] of Object.entries(this.labels)) {
      availableAccessibilities.push(_(elems[accessibilityList[label]]));
    }

    if (this.state.isCollapsed) {
      return this.renderCollapsed(availableAccessibilities);
    }
    return this.renderExpanded(availableAccessibilities);
  }
}
