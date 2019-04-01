import Panel from "../libs/panel";
import panelView from "../views/categories_panel.dot"
import MinimalHourPanel from "./poi_bloc/opening_minimal";

export class CategoriesPanel {
  constructor() {
    this.minimalHourPanel = new MinimalHourPanel()
    this.panel = new Panel(this, panelView)


    this.isOpen = false

  }
}
