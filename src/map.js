import Scene from './adapters/scene'
import UrlState from './proxies/url_state'
let scene = new Scene()
UrlState.load()
scene.initMapBox()
