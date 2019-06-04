import ImagesPanelView from '../../views/poi_bloc/images.dot'
import Panel from "../../libs/panel";

export default class ImagesPanel {
  constructor(block, poi) {
    this.panel = new Panel(this, ImagesPanelView)
    this.images = block.images.filter(img => img.url !== poi.topImageUrl)
  }
}
