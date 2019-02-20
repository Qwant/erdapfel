const {mappings, defaultIcon, defaultColor, defaultAdministrativeIcon, defaultAdministrativeColor} = require('@qwant/qwant-basic-gl-style/icons.yml')

const iconsGroups = []
iconsGroups['poi'] = mappings
const adminGroups = ['house', 'address', 'country', ]

export default class IconManager {
  static get({className, subClassName, type}) {

    let icons = iconsGroups[type]
    if(type === 'poi') {
      let icon = icons.find((iconProperty) => {
        return iconProperty.subclass === subClassName && iconProperty.class === className
      })
      if (!icon) {
        icon = icons.find((iconProperty) => {
          return iconProperty.subclass === subClassName && !iconProperty.class
        })
      }
      if (!icon) {
        icon = icons.find((iconProperty) => {
          return iconProperty.class === className && !iconProperty.subclass
        })
      }

      if (icon) {
        let iconName = icon.iconName
        let color = icon.color
        let iconClass = iconName.match(/^(.*?)-[0-9]{1,2}$/)[1]
        return {iconClass: iconClass, color: color}
      } else {
        return {iconClass: defaultIcon.match(/^(.*?)-[0-9]{1,2}$/)[1], color: defaultColor}
      }
    } else if(icons) {
      return {}
    } else {
      return {iconClass : defaultAdministrativeIcon.match(/^(.*?)-[0-9]{1,2}$/)[1], color : defaultAdministrativeColor}
    }
  }
}

window.IconManager = IconManager