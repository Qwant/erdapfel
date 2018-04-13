import BreweryView from '../../views/poi_bloc/brewery.dot'
import Panel from "../../libs/panel";
import PoiPanel from "../poi_panel"
import Website from "./website_panel";
/**
 *
 * @param name
 * @param time
 * @param timeMessages [time : xx, message : 'opening soon' .. // -1 for open message
 * @constructor
 */

function Brewery(tag) {
  this.panel = new Panel(this, BreweryView)
  this.beers = tag.values.split(';')
}

export default Brewery