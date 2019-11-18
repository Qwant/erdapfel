/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AccessibilityBlock from '../../views/poi_bloc/Accessibility';
import BreweryBlock from '../../views/poi_bloc/Brewery';
import InternetAccessBlock from '../../views/poi_bloc/InternetAccess';
import WikiBlock from '../../views/poi_bloc/Wiki';

function findBlock(blocks, toFind) {
  for (let i = 0; i < blocks.length; ++i) {
    if (blocks[i].type === toFind) {
      return blocks[i];
    } else if (blocks[i].blocks !== undefined) {
      const ret = findBlock(blocks[i].blocks, toFind);
      if (ret !== null) {
        return ret;
      }
    }
  }
  return null;
}

export default class InformationBlock extends React.Component {
  static propTypes = {
    block: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = { isCollapsed: true };

    this.accessibilityBlock = findBlock(this.props.block.blocks, 'accessibility');
    this.breweryBlock = findBlock(this.props.block.blocks, 'brewery');
    this.internetAccessBlock = findBlock(this.props.block.blocks, 'internet_access');
    this.wikiBlock = this.props.block.blocks.find(b => b.type === 'wikipedia');

    this.expandCollapse = () => {
      this.setState(state => ({
        isCollapsed: !state.isCollapsed,
      }));
    };
  }

  checkSubBlocks() {
    return this.accessibilityBlock || this.breweryBlock || this.internetAccessBlock;
  }

  getText() {
    if (!this.state.isCollapsed) {
      return _('Services & information');
    }
    return <div>
      {this.accessibilityBlock && <AccessibilityBlock block={this.accessibilityBlock} asString/>}
      {this.accessibilityBlock && this.internetAccessBlock && ' - '}
      {this.internetAccessBlock && <InternetAccessBlock block={this.internetAccessBlock} asString/>}
      {this.internetAccessBlock && this.breweryBlock && ' - '}
      {this.breweryBlock && <BreweryBlock block={this.breweryBlock} asString/>}
    </div>;
  }

  renderTitle() {
    return [
      <div className="icon-icon_info poi_panel__block__symbol" key="1" />,
      <div className="poi_panel__sub_block__title" key="2" onClick={this.expandCollapse}>
        <h4 className="poi_panel__sub_block__title__text">{this.getText()}</h4>
        <div className={
          classnames('poi_panel__block__collapse', 'icon-icon_chevron-down', {
            'poi_panel__block__collapse--reversed': !this.state.isCollapsed,
          })} />
      </div>,
    ];
  }

  renderExpanded() {
    if (this.state.isCollapsed) {
      return null;
    }
    return <div className="poi_panel__service_information__container">
      {this.accessibilityBlock && <AccessibilityBlock block={this.accessibilityBlock} />}
      {this.internetAccessBlock && <InternetAccessBlock block={this.internetAccessBlock} />}
      {this.breweryBlock && <BreweryBlock block={this.breweryBlock} />}
    </div>;
  }

  render() {
    if (!this.wikiBlock && !this.checkSubBlocks()) {
      return null;
    }
    return <div className="poi_panel__info__section poi_panel__info__section--information">
      { this.wikiBlock && <WikiBlock block={this.wikiBlock} /> }
      { this.checkSubBlocks() && this.renderTitle() }
      { this.checkSubBlocks() && this.renderExpanded() }
    </div>;
  }
}
