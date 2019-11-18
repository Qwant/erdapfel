import InformationsView from '../../views/poi_bloc/informations.dot';
import Panel from '../../libs/panel';
import PoiBlockContainer from './PoiBlockContainer';

export default class Informations {
  constructor(block) {
    this.PoiBlockContainer = new PoiBlockContainer();
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
          b.blocks = b.blocks.filter(b => this.PoiBlockContainer.getBlock(b.type));
          return b.blocks.length > 0;
        }
        return true;
      })
      .filter(b => this.PoiBlockContainer.getBlock(b.type));
  }

  renderPoiBlockContainer() {
    ReactDOM.render(<PoiBlockContainer poi={this} />,
      document.getElementById('information_react_1'));
  }
}
