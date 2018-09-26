import OpenDataPanelView from '../views/open_data.dot'
import Panel from "../libs/panel"

export default class OpenDataPanel {
  constructor() {
    this.panel = new Panel(this, OpenDataPanelView)
  }
}