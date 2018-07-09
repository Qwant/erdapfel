import BreweryView from '../../views/poi_bloc/brewery.dot'
import Panel from "../../libs/panel";

function Brewery(block) {
  this.panel = new Panel(this, BreweryView)
  this.beers = block.beers
}

export default Brewery
