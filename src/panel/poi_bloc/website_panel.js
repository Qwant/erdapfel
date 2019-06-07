import WebsiteView from '../../views/poi_bloc/website.dot'
import Panel from "../../libs/panel"
import URI from "../../../local_modules/uri/index"
import Telemetry from "../../libs/telemetry";

function Website(block, poi) {
  this.URI = URI
  this.block = block
  this.panel = new Panel(this, WebsiteView)
  this.poi = poi
}

Website.prototype.clickWebsite = function () {
  Telemetry.add("website", "poi", this.poi.meta.source,
                {
                  "api_ia_click_link_data": {
                    "ia_name": "local",
                    "type": this.poi.meta.source,
                    "template": "single",
                    "link": "website",
                    "item": this.poi.id.startsWith("pj:") ? this.poi.id.slice(3) : this.poi.id,
                    "category": "unknown",
                  }
                })
}

export default Website
