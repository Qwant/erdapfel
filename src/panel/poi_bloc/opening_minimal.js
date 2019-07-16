import HourPanelView from '../../views/poi_bloc/hour_next_transition_partial.dot';
import Panel from '../../libs/panel';
import OsmSchedule from '../../../src/adapters/osm_schedule';
import constants from '../../../config/constants.yml';

export default class MinimalHourPanel {
  constructor() {
    this.messages = constants.pois.find(poiConfig => poiConfig.apiName === 'opening_hours')
      .options
      .messages;
    this.panel = new Panel(this, HourPanelView);
    this.opening = null;
  }

  set(poi) {
    const openingBlock = poi.blocks.find(block => block.type === 'opening_hours');
    this.opening = null;
    if (openingBlock) {
      this.opening = new OsmSchedule(openingBlock, this.messages);
    }
    return this;
  }
}
