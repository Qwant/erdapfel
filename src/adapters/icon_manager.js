import styleIcons from '@qwant/qwant-basic-gl-style/icons.yml'

export default class IconManager {
  static get({className, subClassName, type}) {
    const nameToClass = (iconName) => iconName.match(/^(.*?)-[0-9]{1,2}$/)[1]

    if(type === 'poi' || type === 'category') {
      const icons = styleIcons.mappings
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
        let iconClass = nameToClass(iconName)
        return {iconClass: iconClass, color: color}
      }

      return {
        iconClass: nameToClass(styleIcons.defaultIcon),
        color: styleIcons.defaultColor
      }
    } else if(type === 'house' || type === 'address'){
      return {
        iconClass: nameToClass(styleIcons.defaultAddressIcon),
        color: styleIcons.defaultAddressColor
      }
    }
    else if(type === 'street'){
      return {
        iconClass: nameToClass(styleIcons.defaultStreetIcon),
        color: styleIcons.defaultStreetColor
      }
    } else { // administrative zones
      return {
        iconClass : nameToClass(styleIcons.defaultAdministrativeIcon),
        color : styleIcons.defaultAdministrativeColor
      }
    }
  }
}

export function createIcon(iconOptions, name, hoverEffect = false) {
  const icon = IconManager.get(iconOptions)
  const element = document.createElement('div')
  element.innerHTML = `
    <div class="marker">
      <div class="marker-container${hoverEffect ? ' poi-hoverable' : ''}">
        <i class="icon icon-${icon.iconClass}"></i>
      </div>
      ${markerLabel}
    </div>
  `
  return element.firstElementChild
};

window.IconManager = IconManager
