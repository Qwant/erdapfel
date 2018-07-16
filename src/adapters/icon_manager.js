const iconProperties = require('@qwant/qwant-basic-gl-style/icons.yml').mappings

function IconManager() {}

IconManager.mappings = iconProperties.map((mapping) => {return mapping})

IconManager.get = ({className, subClassName}) => {
  let icon = iconProperties.find((iconProperty) => {
    return iconProperty.subclass === subClassName && iconProperty.class === className
  })
  if(!icon) {
    icon = iconProperties.find((iconProperty) => {
      return iconProperty.subclass === subClassName && !iconProperty.class
    })
  }
  if(!icon) {
    icon = iconProperties.find((iconProperty) => {
      return iconProperty.class === className && !iconProperty.subclass
    })
  }

  if(icon) {
    let iconName = icon.iconName
    let color = icon.color
    let iconClass = iconName.match(/^(.*?)-[0-9]{1,2}$/)[1]
    return {iconClass : iconClass, color : color}
  }
}

window.IconManager = IconManager

export default IconManager