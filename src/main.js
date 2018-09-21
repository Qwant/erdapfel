import I18n from './libs/i18n'
import './libs/listen'
import './libs/actions'
import App from './panel/app'
import Autocomplete from './adapters/autocomplete'

async function main() {
  new I18n()
  await setLang()
  new Autocomplete('#search')
  new App('panels')
}
main()
