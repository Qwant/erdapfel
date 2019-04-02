import Panel from "../libs/panel";
import panelView from "../views/categories_panel.dot"
import MinimalHourPanel from "./poi_bloc/opening_minimal";
import Ajax from "../libs/ajax";

export class CategoriesPanel {
  constructor() {
    this.minimalHourPanel = new MinimalHourPanel()
    this.panel = new Panel(this, panelView)

    this.pois = []
    this.isOpen = false

  }

  async fullFill() {
    let bbox = window.mapGetBounds()
    console.log(bbox)

    this.pois = await Ajax.get('https://maps.dev.qwant.ninja/maps/geocoder/places_list/', {bbox : bbox,size : '', category : 'leisure'})
    this.panel.update()
  }
}
