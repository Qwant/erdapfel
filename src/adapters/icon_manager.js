const iconProperties = require('@qwant/qwant-basic-gl-style/icons.yml')
const sprite = require('../../public/sprite.json')


function IconManager() {}

IconManager.get = (className, subClassName) => {
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
    let imageProperties = sprite[iconName]
    return {iconName : iconName, color : color, imageProperties : imageProperties}
  }
}

IconManager.img = (poi) => {
  let iconData = IconManager.get(poi.className, poi.subClassName)
  if(iconData) {
    return `<div style="background:url('/sprite.png') -${iconData.imageProperties.x}px -${iconData.imageProperties.y}px ;height:${iconData.imageProperties.height}px;width:${iconData.imageProperties.width}px;"></div>`
  } else {
    return ''
  }
}

window.iconImage = IconManager.img

export default IconManager