import '@babel/polyfill';
import Scene from './adapters/scene';
import UrlState from './proxies/url_state';
const scene = new Scene();
UrlState.load();
scene.initScene();
