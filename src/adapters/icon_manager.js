const {mappings, defaultIcon, defaultColor, defaultAdministrativeIcon, defaultAdministrativeColor} = require('@qwant/qwant-basic-gl-style/icons.yml')

function IconManager() {}

IconManager.mappings = mappings.map((mapping) => {return mapping})

IconManager.get = ({className, subClassName, type}) => {
  if(type === 'poi') {
    let icon = mappings.find((iconProperty) => {
      return iconProperty.subclass === subClassName && iconProperty.class === className
    })
    if(!icon) {
      icon = mappings.find((iconProperty) => {
        return iconProperty.subclass === subClassName && !iconProperty.class
      })
    }
    if(!icon) {
      icon = mappings.find((iconProperty) => {
        return iconProperty.class === className && !iconProperty.subclass
      })
    }

    if(icon) {
      let iconName = icon.iconName
      let color = icon.color
      let iconClass = iconName.match(/^(.*?)-[0-9]{1,2}$/)[1]
      return {iconClass : iconClass, color : color}
    } else {
      return {iconClass : defaultIcon.match(/^(.*?)-[0-9]{1,2}$/)[1], color : defaultColor}
    }
  } else {
    return {iconClass : defaultAdministrativeIcon.match(/^(.*?)-[0-9]{1,2}$/)[1], color : defaultAdministrativeColor}
  }
}

window.IconManager = IconManager

export default IconManager