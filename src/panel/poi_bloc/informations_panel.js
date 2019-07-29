import InformationsView from '../../views/poi_bloc/informations.dot';
import Panel from '../../libs/panel';
import PoiBlocContainer from './poi_bloc_container';

export default class Informations {
  constructor(block) {
    this.PoiBlocContainer = PoiBlocContainer;
    this.blocks = this.cleanBlocks(block.blocks);
    this.panel = new Panel(this, InformationsView);
    this.extended = false;
  }

  cleanBlocks(blocks) {
    /*
      Exclude not implemented blocks, and blocks
      where all nested blocks are not implemented
    */
    return blocks
      .filter(b => {
        if (b.blocks) {
          b.blocks = b.blocks.filter(b => PoiBlocContainer.getBlock(b.type));
          return b.blocks.length > 0;
        }
        return true;
      })
      .filter(b => PoiBlocContainer.getBlock(b.type));
  }
}
