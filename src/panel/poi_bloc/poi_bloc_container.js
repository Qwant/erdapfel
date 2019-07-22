import Panel from '../../libs/panel';
import PoiBlocContainerView from '../../views/poi_bloc/poi_bloc_container.dot';
import constants from 'config/constants.yml';

function PoiBlocContainer() {}

PoiBlocContainer.initBlockComponents = function() {
  PoiBlocContainer.blockComponents = constants.pois.reduce((accBlocks, poiBlock) => {
    accBlocks[poiBlock.apiName] = {
      /* eslint-disable-next-line */
      poiBlockConstructor: require(`./${poiBlock.panelName}_panel`),
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
