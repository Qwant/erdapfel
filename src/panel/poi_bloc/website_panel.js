import WebsiteView from '../../views/poi_bloc/website.dot';
import Panel from '../../libs/panel';
import URI from '../../../local_modules/uri/index';
import Telemetry from '../../libs/telemetry';

function Website(block, poi) {
  this.URI = URI;
  this.block = block;
  this.panel = new Panel(this, WebsiteView);
  this.poi = poi;
}

Website.prototype.clickWebsite = function() {
  Telemetry.add('website', 'poi', this.poi.meta.source,
    Telemetry.buildInteractionData(
      {
        'id': this.poi.id,
        'source': this.poi.meta.source,
        'template': 'single',
        'zone': 'detail',
        'element': 'website',
      }
    )
  );
};

export default Website;
