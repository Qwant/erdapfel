import WebsiteView from 'src/views/poi_bloc/website.dot';
import Panel from 'src/libs/panel';
import URI from '@qwant/uri';
import Telemetry from 'src/libs/telemetry';

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
