import ImagesPanelView from '../../views/poi_bloc/images.dot'
import Panel from "../../libs/panel";

export default class ImagesPanel {
  constructor() {
    this.panel = new Panel(this, ImagesPanelView)
    this.images = []
  }

  set({ blocks, topImageUrl }) {
    const imagesBlock = blocks.find(block => block.type === 'images');
    if (imagesBlock) {
      this.images = imagesBlock.images.filter(img => img.url !== topImageUrl);
    }
    return this
  }

  render() {
    return this.panel.render()
  }
}
