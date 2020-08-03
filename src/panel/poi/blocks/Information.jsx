/* global _ */
import React from 'react';
import Services from './Services';

import Block from 'src/panel/poi/blocks/Block';

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
  const services = {
    accessibility: findBlock(block.blocks, 'accessibility'),
    internetAccess: findBlock(block.blocks, 'internet_access'),
    brewery: findBlock(block.blocks, 'brewery'),
  };

  const hasServices = Object.values(services).some(service => service);

  if (!hasServices) {
    return null;
  }

  return <Block icon="icon_info" title={_('Services & information')}>
    {hasServices && <Services {...services} />}
  </Block>;
};

export default InformationBlock;
