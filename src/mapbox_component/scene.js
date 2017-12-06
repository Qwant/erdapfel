import mapboxgl from 'mapbox-gl'
import AdminControl from "../mapbox_controllers/admin_control";
import ExtendedControl from "../mapbox_controllers/extended_nav_control";

import PoiAction from './poi_action'

import genStyle from '../style'
import conf from 'json-loader!yaml-loader!../../config/external_api_url.yaml'
function Scene() {
  const scene = new mapboxgl.Map({
    container: 'scene_container',
    style: genStyle(false),
    zoom: 14,
    center: [2.2900, 48.8719],
    hash: true
  });

  const extendedControl = new ExtendedControl();
  scene.addControl(extendedControl, 'bottom-right');

  const adminControl = new AdminControl();
  scene.addControl(adminControl, 'top-right');

  new PoiAction(scene)
}


export default Scene


