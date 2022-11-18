/* global _ */

/**
 * Simple Category helper
 */
import { findIndexIgnoreCase, capitalizeFirst } from '../libs/string';
import { CATEGORY_TYPE } from '../../config/constants.yml';

export default class Category {
  constructor(name, label, shortLabel, iconName, color, ecoResponsible) {
    this.name = name;
    this.label = _(label);
    this.shortLabel = _(shortLabel);
    this.iconName = iconName;
    this.color = color;
    this.ecoResponsible = ecoResponsible;
    this.alternativeName = _('category');
    this.type = CATEGORY_TYPE;
    this.id = `category:${name}`;
  }

  getInputValue() {
    return capitalizeFirst(this.label);
  }

  isMatching(term) {
    let matched = false;

    const prefixLength = Math.min(4, this.label.length);
    // Match label prefix (eg: "supe" for "Supermarché", but not "supel")
    if (!matched && term.length >= prefixLength) {
      if (this.label.length < term.length) {
        // check if first word in term is label
        matched = findIndexIgnoreCase(term, `${this.label} `) === 0;
      } else {
        matched = findIndexIgnoreCase(term, this.label.substring(0, term.length)) === 0;
      }
    }

    return matched;
  }

  static create(options) {
    const name = options?.name || '';
    const label = options?.label || '';
    const shortLabel = options?.shortLabel || label;
    const icon = options?.icon || null;
    const color = options?.color || '';
    const ecoResponsible = options?.ecoResponsible || false;
    return new Category(name, label, shortLabel, icon, color, ecoResponsible);
  }
}
