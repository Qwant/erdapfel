import React from 'react';
import WikiBlock from './Wiki';
import Services from './Services';

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

  const services = <Services
    accessibility={findBlock(block.blocks, 'accessibility')}
    internetAccess={findBlock(block.blocks, 'internet_access')}
    brewery={findBlock(block.blocks, 'brewery')}
  />;

  if (!wikipedia && !services) {
    return null;
  }

  return <div className="poi_panel__info__section poi_panel__info__section--information">
    <div className="icon-icon_info poi_panel__block__symbol" />
    {wikipedia && <WikiBlock block={wikipedia} />}
    {services}
  </div>;
};

export default InformationBlock;
