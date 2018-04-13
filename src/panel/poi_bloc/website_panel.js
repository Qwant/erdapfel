import WebsiteView from '../../views/poi_bloc/website.dot'
import Panel from "../../libs/panel"
import URI from "../../libs/uri"

function Website(tag) {
  this.URI = URI
  this.tag = tag
  this.panel = new Panel(this, WebsiteView)
}

export default Website