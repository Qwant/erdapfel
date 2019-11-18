/* global require */
import Panel from '../../libs/panel';
import renderStaticReact from 'src/libs/renderStaticReact';
import React from 'react';
import PropTypes from 'prop-types';
import HourBlock from '../../views/poi_bloc/Hour';
import WikiBlock from '../../views/poi_bloc/Wiki';
import AccessibilityBlock from '../../views/poi_bloc/Accessibility';
import BreweryBlock from '../../views/poi_bloc/Brewery';
import InternetAccessBlock from '../../views/poi_bloc/InternetAccess';
import ContactBlock from '../../views/poi_bloc/Contact';
import ImagesBlock from '../../views/poi_bloc/Images';

function findBlock(blocks, toFind) {
  for (let i = 0; i < blocks.length; ++i) {
    const block = blocks[i];
    if (block.type === toFind) {
      return block;
    } else if (block.blocks !== undefined) {
      const ret = findBlock(block.blocks, toFind);
      if (ret !== null) {
        return ret;
      }
    }
  }
  return null;
}

export default class PoiBlockContainer extends React.Component {
  static propTypes = {
    poi: PropTypes.object,
    asString: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.poi = null;
  }

  set(poi) {
    this.poi = poi;
  }

  toString(blocks) {
    return this.render(blocks, true);
  }

  getBlock(blockName) {
    return ['opening_hours', 'website', 'wikipedia', 'services_and_information', 'information',
            'accessibility', 'brewery', 'internet_access', 'contact',
            'images'].find(b => b === blockName);
  }

  render() {
    if (!this.props.poi || !this.props.poi.blocks) {
      return null;
    }
    const blocks = this.props.poi.blocks;
    console.log(blocks);
    const hourBlock = findBlock(blocks, 'opening_hours');
    const wikiBlock = findBlock(blocks, 'wikipedia');
    const accessibilityBlock = findBlock(blocks, 'accessibility');
    const breweryBlock = findBlock(blocks, 'brewery');
    const internetAccessBlock = findBlock(blocks, 'internet_access');
    const contactBlock = findBlock(blocks, 'contact');
    const imagesBlock = findBlock(blocks, 'images');

    return <div className="poi_panel__info">
      {hourBlock && <HourBlock block={hourBlock} asString />}
      <div className="poi_panel__info__section poi_panel__info__section--information">
        {wikiBlock && <WikiBlock block={wikiBlock} />}
        {accessibilityBlock && <AccessibilityBlock block={accessibilityBlock} asString />}
      </div>
      {breweryBlock && <BreweryBlock block={breweryBlock} asString />}
      {internetAccessBlock && <InternetAccessBlock block={internetAccessBlock} asString />}
      {contactBlock && <ContactBlock block={contactBlock} asString />}
      {imagesBlock && <ImagesBlock block={imagesBlock} poi={this.props.poi} />}
    </div>;
  }
}

/*function PoiBlocContainer() {}

PoiBlocContainer.initBlockComponents = function() {
  const pois = [
    ['opening_hours', 'hour_panel'],
    ['website', 'website_panel'],
    ['wikipedia', 'Wiki'],
    ['services_and_information', 'services_information_panel'],
    ['information', 'informations_panel'],
    ['accessibility', 'Accessibility'],
    ['brewery', 'Brewery'],
    ['internet_access', 'InternetAccess'],
    ['contact', 'Contact'],
    ['images', 'Images'],
  ];
  PoiBlocContainer.blockComponents = {};
  for (const [apiName, panelName] of pois) {
    let builder;
    try {
      builder = require(`./${panelName}`);
    } catch (err) {
      const ReactComponent = require(`../../views/poi_bloc/${panelName}`).default;
      builder = {
        default: function reactBlockWrapper(block, poi, options) {
          this.render = () => renderStaticReact(
            <ReactComponent block={block} poi={poi} options={options} />);
          this.toString = () => renderStaticReact(
            <ReactComponent block={block} poi={poi} options={options} asString />);
        },
      };
    }
    PoiBlocContainer.blockComponents[apiName] = {
      poiBlockConstructor: builder,
      options: {},
    };
  }
};
PoiBlocContainer.initBlockComponents();

PoiBlocContainer.set = function(poi) {
  PoiBlocContainer.poi = poi;
  return PoiBlocContainer.render(poi);
};

PoiBlocContainer.render = function(poi) {
  this.poi = poi;
  PoiBlocContainer.panel = new Panel(PoiBlocContainer, PoiBlocContainerView);
  return PoiBlocContainer.panel.render();
};

PoiBlocContainer.getBlock = function(name) {
  return PoiBlocContainer.blockComponents[name];
};

PoiBlocContainer.renderBlock = function(block) {
  const blockComponent = getBlockComponent(block);
  if (blockComponent) {
    return blockComponent.render();
  }
  console.warn(`info : component missing (${block.type})`);
};

PoiBlocContainer.toString = function(blocks) {
  return blocks.map(block => {
    const blockComponent = getBlockComponent(block);
    if (blockComponent) {
      return blockComponent.toString();
    }
    return '';
  }).join(' - ');
};

// private
function getBlockComponent(block) {
  const blockComponent = PoiBlocContainer.blockComponents[block.type];
  if (blockComponent) {
    return new blockComponent.poiBlockConstructor.default(
      block,
      PoiBlocContainer.poi,
      blockComponent.options,
    );
  }
  return null;
}

export default PoiBlocContainer;*/
