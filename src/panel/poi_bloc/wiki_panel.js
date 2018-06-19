import WikiPanelView from '../../views/poi_bloc/wiki.dot'
import Panel from "../../libs/panel"
import Ajax from "../../libs/ajax"
import ExtendedString from "../../libs/string"

function WikiPanel(tag) {
  this.tag = null
  this.STATE = {
    LOADING : 0,
    LOADED : 1
  }

  this.descriptionLength = 100

  this.panel = new Panel(this, WikiPanelView)
  this.ExtendedString = ExtendedString
  this.data = null
  this.state = this.STATE.LOADING
  this.collapsed = true
  /* block are built before displayed */
  this.panel.onRender = () => {
    this.getData(tag)
  }
}

WikiPanel.prototype.getData = async function(tag) {
  if(tag.value !== this.tag) {
    this.collapsed = true
    this.tag = tag.value
    this.state = this.STATE.LOADING
    await this.panel.update()
    this.data = {} // will be integrated to poi api
    this.state = this.STATE.LOADED
    this.tag = tag.value
    this.panel.update()
  }
}

WikiPanel.prototype.toggle = function() {
  this.panel.toggleClassName(.3, '.poi_panel__info__wiki', 'poi_panel__info__wiki--open')
}

WikiPanel.prototype.toggleEllipsis = function() {
  this.collapsed = !this.collapsed
  this.panel.update()
}

export default WikiPanel
