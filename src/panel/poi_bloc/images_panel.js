import ImagesPanelView from '../../views/poi_bloc/images.dot'
import Panel from "../../libs/panel";

export default class ImagesPanel {
    constructor(block){
      this.panel = new Panel(this, ImagesPanelView)
      this.name = block.name
      this.block = block
    }
}
