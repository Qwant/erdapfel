import Autocomplete from '../vendors/autocomplete'
import IconManager from '../adapters/icon_manager'
import {layout} from '../../config/constants.yml'
import ExtendedString from "../libs/string"
import BragiPoi from "./poi/bragi_poi"
import PoiStore from "./poi/poi_store"
import Category from "./category"
import CategoryService from "./category_service"

export default class Suggest {
  constructor({tagSelector, onSelect, prefixes = [], withCategories = false, menuClass = ''}) {
    this.searchInputDomHandler = document.querySelector(tagSelector)
    this.poi = null
    this.bragiPromise = null
    this.historyPromise = null
    this.suggestList = []
    this.pending = false
    this.onSelect = onSelect

    this.prefixes = prefixes

    this.autocomplete = new Autocomplete({
      selector: tagSelector,
      minChars: 0,
      cachePrefix: false,
      delay: 100,
      menuClass : menuClass,
      width: '650px',
      updateData: (items) => {
        this.suggestList = items
        this.pending = false
      },
      source: (term) => {
        let promise
        if (term === '') {
          // Prerender Favorites on focus in empty field
          promise = PoiStore.getAll()
        }
        else {
          promise = new Promise(async (resolve, reject) => {
            this.suggestList = []

            /* 'bbox' is currently not used by the geocoder, it' will be used for the telemetry. */
            this.historyPromise = PoiStore.get(term)
            this.bragiPromise = BragiPoi.get(term)
            this.categoryPromise = withCategories ? CategoryService.getMatchingCategories(term) : null

            try {
              const [bragiResponse, storeResponse, categoryResponse] = await Promise.all([
                this.bragiPromise, this.historyPromise, this.categoryPromise
              ])

              if (categoryResponse)
                this.suggestList = this.suggestList.concat(categoryResponse)

              if (bragiResponse) {
                this.bragiPromise = null
                this.suggestList = this.suggestList.concat(bragiResponse)
              }

              this.suggestList = this.suggestList.concat(storeResponse)

              resolve(this.suggestList)
            } catch (e) {
              reject(e)
            }
          })
        }
        promise.abort = () => {
          this.bragiPromise.abort()
        }
        return promise
      },

      renderItems: (pois) => {
        let favorites = []
        let remotes = []
        let categories = []
        pois.forEach((poi) => {
          if (poi instanceof PoiStore) {
            favorites.push(poi)
          } if (poi instanceof  Category) {
            categories.push(poi)
          } else {
            remotes.push(poi)
          }
        })
        let suggestDom = this.prefixesRender()
        suggestDom += this.categoriesRender(categories)
        suggestDom += this.remotesRender(remotes)
        if (favorites.length > 0) {
          suggestDom += this.favoritesRender(favorites)
        }
        return suggestDom
      },

      onSelect: (e, term, item, items) => {
        e.preventDefault()
        const itemId = item.getAttribute('data-id')
        let prefixPoint = this.prefixes.find((prefix) => prefix.id === itemId)
        if(prefixPoint) {
          this.onSelect(prefixPoint)
        } else {
          let poi = items.find(poi => poi.id === itemId)
          this.onSelect(poi)
        }
        this.searchInputDomHandler.blur()
      }
    })

    this.searchInputDomHandler.onkeydown = (event) => {
      if (event.keyCode !== 13) { /* prevent enter key */
        this.pending = true
      }
    }
  }

  async preselect(term) {
    let suggestList = await this.autocomplete.prefetch(term)
    if (suggestList && suggestList.length > 0) {
      let firstPoi = suggestList[0]
      this.onSelect(firstPoi)
      this.searchInputDomHandler.blur()
    }
    return suggestList
  }

  setIdle(idle) {
    this.searchInputDomHandler.readOnly = idle
  }

  async onSubmit() {
    if(this.pending) {
      if(this.bragiPromise) {
        this.bragiPromise.abort()
      }
      let term = this.searchInputDomHandler.value
      this.preselect(term)
    } else {
      if (this.suggestList && this.suggestList.length > 0
        && this.searchInputDomHandler.value
        && this.searchInputDomHandler.value.length > 0) {
        this.onSelect(this.suggestList[0])
        this.searchInputDomHandler.blur()
      }
    }
  }

  destroy() {
    this.autocomplete.destroy()
  }

  preRender(items) {
    this.autocomplete.preRender(items)
  }

  prefixesRender() {
    return this.prefixes.map(prefix => prefix.render())
  }

  remotesRender(pois) {
    return pois.map(poi => this.renderItem(poi)).join('')
  }

  categoriesRender(categories) {
    if (!categories) return ''

    return categories.map(category => this.renderCategory(category)).join('')
  }

  favoritesRender(pois) {
    return `<h3 class="autocomplete_suggestion__category_title" onmousedown="return false;">${_('FAVORITES', 'autocomplete')}</h3> ${pois.map(poi => this.renderItem(poi)).join('')}`
  }

  getValue() {
    return this.autocomplete.getValue()
  }

  setValue(value) {
    this.autocomplete.setValue(value)
    this.preRender()
  }

  clear() {
    this.autocomplete.clear()
  }

  /* select sub template */
  renderItem(poi) {
    const {id, name, fromHistory, className, subClassName, type, alternativeName} = poi
    const icon = IconManager.get({className : className, subClassName : subClassName , type : type})
    const iconDom = `<div style="color:${icon ? icon.color : ''}" class="autocomplete-icon ${`icon icon-${icon.iconClass}`}"></div>`

    return `
      <div class="autocomplete_suggestion${fromHistory ? ' autocomplete_suggestion--history' : ''}" data-id="${id}" data-val="${ExtendedString.htmlEncode(poi.getInputValue())}">
        ${this.renderLines(iconDom, name, alternativeName)}
      </div>
    `
  }

  renderCategory(category) {
    const { label, alternativeName, color, backgroundColor } = category
    const icon = category.getIcon()
    const iconDom = `<div style="color: ${color}; background: ${backgroundColor}" class="autocomplete-icon autocomplete-icon-rounded ${`icon icon-${icon.iconClass}`}"></div>`

    return `
      <div class="autocomplete_suggestion" data-type="category" data-val="${ExtendedString.htmlEncode(category.getInputValue())}">
        ${this.renderLines(iconDom, label, alternativeName)}
      </div>
    `
  }

  renderLines(iconDom, firstLabel, secondLabel) {
    return `
      <div class="autocomplete_suggestion__first_line__container">
        ${iconDom}
        <div class="autocomplete_suggestion__first_line">${ExtendedString.htmlEncode(firstLabel)}</div>
      </div>
      <div class="autocomplete_suggestion__second_line">${ExtendedString.htmlEncode(secondLabel ? secondLabel : '')}</div>
    `
  }
}

