import I18n from './libs/i18n'
import Action from './libs/actions'
import Listen from './libs/listen'

import Scene from './adapters/scene'
import Store from './adapters/store'
import Autocomplete from './adapters/autocomplete'

import FavoritePanel from './panel/favorites_panel'
import PoiPanel from './panel/poi_panel'

new I18n()

new Scene()
new Autocomplete('#search')

const store = new Store()
store.getAll()

new FavoritePanel()
new PoiPanel()
