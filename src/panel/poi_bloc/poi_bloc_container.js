/* global require */
import Panel from '../../libs/panel';
import PoiBlocContainerView from '../../views/poi_bloc/poi_bloc_container.dot';
import constants from 'config/constants.yml';
import React from 'react';
import renderStaticReact from 'src/libs/renderStaticReact';

function PoiBlocContainer() {}

PoiBlocContainer.initBlockComponents = function() {
  PoiBlocContainer.blockComponents = constants.pois.reduce((accBlocks, poiBlock) => {
    let builder;
    try {
      builder = require(`./${poiBlock.panelName}_panel`);
    } catch (err) {
      const name = poiBlock.panelName.charAt(0).toUpperCase() + poiBlock.panelName.slice(1);
      const el = require(`../../views/poi_bloc/${name}`);
      builder = {
        default: (block, poi, options, collapsed) =>
          renderStaticReact(
            <el.default block={block} poi={poi} options={options} collapsed={collapsed} />),
        func: true,
      };
    }
    accBlocks[poiBlock.apiName] = {
      /* eslint-disable-next-line */
      poiBlockConstructor: builder,
      options: poiBlock.options,
    };
    return accBlocks;
  }, {});
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

PoiBlocContainer.setBlock = function(block) {
  const blockComponent = PoiBlocContainer.blockComponents[block.type];
  return new blockComponent.poiBlockConstructor.default(
    block,
    PoiBlocContainer.poi,
    blockComponent.options,
  );
};

PoiBlocContainer.renderBlock = function(block) {
  const blockComponent = getBlockComponent(block, true);
  if (blockComponent) {
    return blockComponent.render ? blockComponent.render() : blockComponent;
  }
  console.warn(`info : component missing (${block.type})`);
};

PoiBlocContainer.toString = function(blocks) {
  return blocks.map(block => {
    const blockComponent = getBlockComponent(block, false);
    if (blockComponent) {
      return blockComponent.toString();
    }
    return '';
  }).join(' - ');
};

/* private */
function getBlockComponent(block, collapsed) {
  const blockComponent = PoiBlocContainer.blockComponents[block.type];
  if (blockComponent) {
    if (blockComponent.poiBlockConstructor.func === true) {
      return blockComponent.poiBlockConstructor.default(
        block,
        PoiBlocContainer.poi,
        blockComponent.options,
        collapsed,
      );
    }
    return new blockComponent.poiBlockConstructor.default(
      block,
      PoiBlocContainer.poi,
      blockComponent.options,
    );
  }
  return null;
}

export default PoiBlocContainer;
