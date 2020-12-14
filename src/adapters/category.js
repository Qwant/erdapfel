/* global _ */

/**
 * Simple Category helper
 */
import { findIndexIgnoreCase, capitalizeFirst } from '../libs/string';
import { CATEGORY_TYPE } from '../../config/constants.yml';

export default class Category {
  constructor(name, label, iconName, color, matcher) {
    this.name = name;
    this.label = _(label);
    this.iconName = iconName;
    this.color = color;
    this.matcher = matcher;
    this.alternativeName = _('category');
    this.type = CATEGORY_TYPE;
    this.id = `category:${name}`;
  }

  getInputValue() {
    return capitalizeFirst(this.label);
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
        matched = findIndexIgnoreCase(term, `${this.label} `) === 0;
      } else {
        matched = findIndexIgnoreCase(
          term, this.label.substring(0, term.length)
        ) === 0;
      }
    }

    return matched;
  }

  static create({ name, label, icon, color, matcher }) {
    return new Category(name, label, icon, color, matcher);
  }
}
