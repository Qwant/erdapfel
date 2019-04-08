import ImagesPanelView from '../../views/poi_bloc/images.dot'
import nextTransitionPartial from '../../views/poi_bloc/hour_next_transition_partial.dot'
import Panel from "../../libs/panel";
import OsmSchedule from '../../../src/adapters/osm_schedule'
import Telemetry from "../../libs/telemetry";

function ImagesPanel(block, poi) {

  console.log(block);
  this.nextTransitionPartial = nextTransitionPartial
  this.panel = new Panel(this, ImagesPanelView)
  this.name = block.name
  this.block = block
  this.latLng = poi.latLon
  this.isCollapsed = true
}

export default ImagesPanel
