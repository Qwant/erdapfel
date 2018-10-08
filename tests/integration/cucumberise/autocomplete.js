import {wait} from '../tools'

const SUGGEST_SELECTOR = '.autocomplete_suggestion'
const CLEAR_BUTTON_SELECTOR = '#clear_button'

export default class AutocompleteCucumberise {
  constructor(page) {
    this.page = page
  }

  async typeAndWait(word) {
    await this.page.keyboard.type(word)
    await this.page.waitForSelector(SUGGEST_SELECTOR)
  }

  async selectSuggest(position) {
    await this.page.click(`.autocomplete_suggestion:nth-child(${position})`)
  }

  async getClearFieldButton() {

  }

  async clearField() {

  }

  async getSuggestList() {
    return await page.evaluate(() => {
      return querySelector(SUGGEST_SELECTOR)
    }, SUGGEST_SELECTOR)
  }

  async prepareResponse(response, query, delay = false) {
    this.page.on('request', async interceptedRequest => {
      if(interceptedRequest.url().match(/autocomplete/)) {
        interceptedRequest.headers['Access-Control-Allow-Origin'] = '*'
        if(delay) {
          await wait(delay)
        }
        interceptedRequest.respond({body : JSON.stringify(response), headers  : interceptedRequest.headers})
      } else {
        interceptedRequest.continue()
      }
    })
  }

}