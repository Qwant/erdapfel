/* global _ */

/**
 * Simple Category helper
 */
import IconManager from '../adapters/icon_manager';
import ExtendedString from '../libs/string';
import { CATEGORY_TYPE } from '../../config/constants.yml';

const DEFAULT_ICON_COLOR = '#ffffff';

export default class Category {
  constructor(name, label, iconName, backgroundColor, matcher) {
    this.name = name;
    this.label = _(label);
    this.iconName = iconName;
    this.backgroundColor = backgroundColor;
    this.matcher = matcher;

    this.color = DEFAULT_ICON_COLOR;
    this.alternativeName = _('category');
    this.type = CATEGORY_TYPE;
    this.id = `category:${name}`;
  }

  getInputValue() {
    return this.label;
  }

  isMatching(term) {
    let matched = false;

    if (this.matcher && this.matcher.regex) {
      matched = new RegExp(`^(${this.matcher.regex})$`, 'i').test(term);
    }

    const prefixLength = Math.min(4, this.label.length);
    // Match label prefix (eg: "supe" for "Supermarché", but not "supel")
    if (!matched && term.length >= prefixLength) {
      if (this.label.length < term.length) {
        // check if first word in term is label
        matched = ExtendedString.compareIgnoreCase(term, `${this.label} `) === 0;
      } else {
        matched = ExtendedString.compareIgnoreCase(
          term, this.label.substring(0, term.length)
        ) === 0;
      }
    }

    return matched;
  }

  getIcon() {
    return IconManager.get({
      className: this.iconName,
      subClassName: this.iconName,
      type: 'category',
    });
  }

  static create({ name, label, icon, color, matcher }) {
    return new Category(name, label, icon, color, matcher);
  }
}
