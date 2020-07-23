import React from 'react';
import WikiBlock from './Wiki';
// import Services from './Services';

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

const InformationBlock = ({ block }) => {
  const wikipedia = block.blocks.find(b => b.type === 'wikipedia');

  const services = {
    accessibility: findBlock(block.blocks, 'accessibility'),
    internetAccess: findBlock(block.blocks, 'internet_access'),
    brewery: findBlock(block.blocks, 'brewery'),
  };

  const hasServices = Object.values(services).some(service => service);

  if (!wikipedia && !hasServices) {
    return null;
  }

  return <div className="poi_panel__info__section poi_panel__info__section--information">
    {wikipedia && <WikiBlock block={wikipedia} />}
    {/* {hasServices && <Services {...services} />} */}
  </div>;
};

export default InformationBlock;
