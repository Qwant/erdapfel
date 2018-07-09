import WebsiteView from '../../views/poi_bloc/website.dot'
import Panel from "../../libs/panel"
import URI from "../../libs/uri"

function Website(block) {
  this.URI = URI
  this.block = block
  this.panel = new Panel(this, WebsiteView)
}

export default Website