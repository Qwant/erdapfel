import I18n from './libs/i18n'
import './libs/listen'
import './libs/actions'
import App from './panel/app'
import Autocomplete from './adapters/autocomplete'

const State = {
  app: null
}

async function main() {
  new I18n()
  await setLang()
  new Autocomplete('#search')
  State.app = new App('panels')
}

main()

export default State
