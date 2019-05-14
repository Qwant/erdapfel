/**
 * Simple Category helper
 */
import IconManager from '../adapters/icon_manager'
import ExtentedString from '../libs/string'

const DEFAULT_ICON_COLOR = "#ffffff"
const CATEGORY_TYPE = 'category'

export default class Category {
  constructor(name, label, iconName, backgroundColor, matcher) {
    this.name = name
    this.label = _(label)
    this.iconName = iconName
    this.backgroundColor = backgroundColor
    this.matcher = matcher

    this.color = DEFAULT_ICON_COLOR
    this.alternativeName = _('category')
    this.type = CATEGORY_TYPE
  }

  getInputValue() {
    return this.label
  }

  isMatching(term) {
    let matched = false

    if (this.matcher && this.matcher.regex)
      matched = new RegExp(this.matcher.regex, 'i').test(term)

    if (!matched)
      matched = ExtentedString.compareIgnoreCase(term, this.label) >= 0

    return matched
  }

  getIcon() {
    return IconManager.get({
      className: this.iconName,
      subClassName: this.iconName,
      type: 'category'
    })
  }

  static of ({ name, label, icon, color, matcher }) {
    return new Category(name, label, icon, color, matcher)
  }
}
