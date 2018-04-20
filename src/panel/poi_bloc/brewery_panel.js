import BreweryView from '../../views/poi_bloc/brewery.dot'
import Panel from "../../libs/panel";

function Brewery(tag) {
  this.panel = new Panel(this, BreweryView)
  this.beers = tag.value.split(';')
}

export default Brewery
