/**
 * Simple Category helper
 */
import ExtentedString from '../libs/string'

const ICON_MAPPING = {
  hotel: 'lodging',
  restaurant: 'restaurant',
  leisure: 'cinema',
  pharmacy: 'pharmacy',
  supermarket: 'grocery',
  bank: 'bank',
  education: 'college',
  bar: 'bar'
}

export const CATEGORY_TYPE = 'category'

export default class Category {
  constructor(name) {
    this.name = ExtentedString.firstUppercase(_(name))
    this.alternativeName = 'Catégorie' // TODO: replace with trad
    this.originalName = name
    this.type = CATEGORY_TYPE
    this.className = this.getClassName()
    this.subClassName = this.getClassName()
  }

  getClassName() {
    return ICON_MAPPING[this.originalName]
  }

  getInputValue() {
    return this.name
  }
}
