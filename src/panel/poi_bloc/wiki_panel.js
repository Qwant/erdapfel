import WikiPanelView from '../../views/poi_bloc/wiki.dot'
import Panel from "../../libs/panel"

function WikiPanel(block) {
  this.wiki = block
  this.tag = null
  this.panel = new Panel(this, WikiPanelView)
}

export default WikiPanel
