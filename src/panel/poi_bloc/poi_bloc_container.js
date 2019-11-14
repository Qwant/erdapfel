/* global require */
import Panel from '../../libs/panel';
import PoiBlocContainerView from '../../views/poi_bloc/poi_bloc_container.dot';
import constants from 'config/constants.yml';
import renderStaticReact from 'src/libs/renderStaticReact';
import React from 'react';

function PoiBlocContainer() {}

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

/* private */
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

export default PoiBlocContainer;
