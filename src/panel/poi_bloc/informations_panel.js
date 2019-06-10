import InformationsView from '../../views/poi_bloc/informations.dot';
import Panel from '../../libs/panel';
import PoiBlocContainer from './poi_bloc_container';

function Informations(block) {
  this.PoiBlocContainer = PoiBlocContainer;
  this.blocks = block.blocks;
  this.panel = new Panel(this, InformationsView);
  this.extended = false;
}

export default Informations;
