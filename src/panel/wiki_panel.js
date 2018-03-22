import WikiPanelView from 'dot-loader!../views/wiki_panel.dot'
import Panel from "../libs/panel";
import Ajax from "../libs/ajax";
const services = require('../../config/services.yml')
/**
 *
 * @param name
 * @param time
 * @param timeMessages [time : xx, message : 'opening soon' .. // -1 for open message
 * @constructor
 */
function WikiPanel() {
  this.panel = new Panel(this, WikiPanelView)
  this.data = null
}

WikiPanel.prototype.getData = async function(tag) {
  if(tag.value !== this.tag) {
    this.data = await Ajax.queryLang(services.wiki.url, {id : tag.value})
  }
  this.tag = tag.value
  this.panel.update()
}

WikiPanel.prototype.toggle = function() {
  this.panel.toggleClassName(.3, '.poi_panel__info__wiki', 'poi_panel__info__wiki--open')
}

export default WikiPanel
