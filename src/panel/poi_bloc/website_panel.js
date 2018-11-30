import WebsiteView from '../../views/poi_bloc/website.dot'
import Panel from "../../libs/panel"
import URI from "../../../local_modules/uri/index"

function Website(block) {
  this.URI = URI
  this.block = block
  this.panel = new Panel(this, WebsiteView)
}

export default Website