/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import renderStaticReact from 'src/libs/renderStaticReact';
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

    console.log(this.props.block);

    this.expandCollapse = this.expandCollapse.bind(this);
  }

  expandCollapse() {
    this.setState(state => ({
      isCollapsed: !state.isCollapsed,
    }));
  }

  checkSubBlocks() {
    return this.accessibilityBlock || this.breweryBlock || this.internetAccessBlock;
  }

  getText() {
    if (!this.state.isCollapsed) {
      return _('Services & information');
    }
    const elems = [];
    if (this.accessibilityBlock) {
      elems.push(renderStaticReact(
        <AccessibilityBlock block={this.accessibilityBlock} asString />));
    }
    if (this.breweryBlock) {
      elems.push(renderStaticReact(
        <BreweryBlock block={this.breweryBlock} asString />));
    }
    if (this.internetAccessBlock) {
      elems.push(renderStaticReact(
        <InternetAccessBlock block={this.internetAccessBlock} asString />));
    }
    return elems.join(' - ');
  }

  renderTitle() {
    return <div className="poi_panel__sub_block__title" onClick={this.expandCollapse}>
      <h4 className="poi_panel__sub_block__title__text">{this.getText()}</h4>
      <div className={
        classnames('poi_panel__block__collapse', 'icon-icon_chevron-down', {
          'poi_panel__block__collapse--reversed': !this.state.isCollapsed,
        })} />
    </div>;
  }

  renderExpanded() {
    if (this.state.isCollapsed) {
      return null;
    }
    return <div className="poi_panel__service_information__container">
      {this.accessibilityBlock && <AccessibilityBlock block={this.accessibilityBlock} />}
      {this.breweryBlock && <BreweryBlock block={this.breweryBlock} />}
      {this.internetAccessBlock && <InternetAccessBlock block={this.internetAccessBlock} />}
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
