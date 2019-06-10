import nconf from '@qwant/nconf-getter';
import configure from '@qwant/mapbox_style_configure';
import URI from '@qwant/uri';
import qwantStyle from '@qwant/qwant-basic-gl-style/style.json';

const mapStyleConfig = nconf.get().mapStyle;
const baseUrl = nconf.get().system.baseUrl;

function sceneConfig() {
  return Object.assign(mapStyleConfig, {spritesUrl: URI.toAbsoluteUrl(location.origin, baseUrl, mapStyleConfig.spritesUrl), fontsUrl: URI.toAbsoluteUrl(location.origin, baseUrl, mapStyleConfig.fontsUrl)});
}

export default function getStyle() {
  return configure(JSON.stringify(qwantStyle), sceneConfig(), window.getBaseLang().code);
}
