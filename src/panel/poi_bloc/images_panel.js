import ImagesPanelView from '../../views/poi_bloc/images.dot'
import Panel from "../../libs/panel";

export default class ImagesPanel {
    constructor(block){
      this.topImageUrl = null
      this.panel = new Panel(this, ImagesPanelView)
      this.name = block.name
      this.block = block
      if(this.block && this.block.images && this.block.images[0]){
        this.topImageUrl = this.block.images[0].url
      }
    }
}
