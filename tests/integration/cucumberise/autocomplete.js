import {wait} from '../tools'

const SUGGEST_SELECTOR = '.autocomplete_suggestion'
const CLEAR_BUTTON_SELECTOR = '#clear_button'
const SEARCH_INPUT_SELECTOR = '#search'

export default class AutocompleteCucumberise {
  constructor(page) {
    this.page = page
    this.isRequestSet = false
  }

  async typeAndWait(word) {
    await this.page.keyboard.type(word)
    await this.page.waitForSelector(SUGGEST_SELECTOR)
  }

  async pressDown() {
    await this.page.keyboard.press('ArrowDown')
  }

  async hoverResult(position) {
    await this.page.hover(`.autocomplete_suggestion:nth-child(${position})`)
  }

  async clickResult(position) {
    await this.page.click(`.autocomplete_suggestion:nth-child(${position})`)
  }


  async getSelectedElementPos() {
    let suggestList = await this.getSuggestList()
    let selectedPosition = -1
    suggestList.forEach((suggest, i) => {
      if(suggest.classes.find((cssClass) => {
        return cssClass.trim() === 'selected'
      }) === 'selected') {
        selectedPosition = i
      }
    })
    return selectedPosition
  }

  async getClearFieldButton() {
    await this.page.waitForSelector(CLEAR_BUTTON_SELECTOR)
  }

  async clearField() {
    return await this.page.click(CLEAR_BUTTON_SELECTOR)
  }

  async getSuggestList() {
    return await this.page.evaluate((SUGGEST_SELECTOR) => {
      let suggests = Array.from(document.querySelectorAll(SUGGEST_SELECTOR))
      return suggests.map((suggest) => {
        return {label : suggest.innerText, classes : Array.from(suggest.classList)}
      })
    }, SUGGEST_SELECTOR)
  }

  async getSearchInputValue() {
    return this.page.evaluate((SEARCH_INPUT_SELECTOR) => {
      return document.querySelector(SEARCH_INPUT_SELECTOR).value
    }, SEARCH_INPUT_SELECTOR)
  }

  async prepareResponse(response, query, delay = false) {
    this.page.on('request', async interceptedRequest => {
      if(interceptedRequest.url().match(query)) {
        interceptedRequest.headers['Access-Control-Allow-Origin'] = '*'
        if(delay) {
          await wait(delay)
        }
        interceptedRequest.respond({body : JSON.stringify(response), headers  : interceptedRequest.headers})
      } else {
        interceptedRequest.continue()
      }
    })

    if(this.isRequestSet === false) {
      await this.page.setRequestInterception(true)
      this.isRequestSet = true
    }
  }
}