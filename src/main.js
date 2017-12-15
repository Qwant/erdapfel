import Search from './component/search_input'
import Scene from './mapbox_component/scene'
import I18n from './libs/i18n'

new I18n()

const scene = new Scene()
new Search('#search', scene)
