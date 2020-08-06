const SUGGEST_SELECTOR = '.autocomplete_suggestions li';
const SEARCH_INPUT_SELECTOR = '#search';
import { getInputValue } from '../tools';

export default class AutocompleteHelper {
  constructor(page) {
    this.page = page;
  }

  async typeAndWait(word) {
    await this.page.keyboard.type(word);
    await this.page.waitForSelector(SUGGEST_SELECTOR);
  }

  async pressDown() {
    await this.page.keyboard.press('ArrowDown');
  }

  async hoverResult(position) {
    await this.page.hover(`.autocomplete_suggestion:nth-child(${position})`);
  }

  async clickResult(position) {
    await this.page.click(`.autocomplete_suggestion:nth-child(${position})`);
  }

  async getSelectedElementPos() {
    const suggestList = await this.getSuggestList();
    return suggestList.findIndex(suggest => {
      return suggest.classes.some(cssClass => {
        return cssClass.trim() === 'selected';
      });
    });
  }

  async getSuggestList() {
    return await this.page.evaluate(SUGGEST_SELECTOR => {
      const suggests = Array.from(document.querySelectorAll(SUGGEST_SELECTOR));
      return suggests.map(suggest => {
        return { label: suggest.innerText, classes: Array.from(suggest.classList) };
      });
    }, SUGGEST_SELECTOR);
  }

  getSearchInputValue() {
    return getInputValue(this.page, SEARCH_INPUT_SELECTOR);
  }
}
