import styleIcons from '@qwant/qwant-basic-gl-style/icons.yml';
import classnames from 'classnames';

const nameToClass = iconName => iconName.match(/^(.*?)-[0-9]{1,2}$/)[1];

export default class IconManager {
  static get({ className, subClassName, type }) {

    // Get the category icon of a PoI
    if (type === 'poi' || type === 'category') {
      const icons = styleIcons.mappings;

      // Matching class and subclass
      let icon = icons.find(iconProperty => {
        return iconProperty.subclass === subClassName && iconProperty.class === className;
      });

      // Or: no class and matching subclass
      if (!icon) {
        icon = icons.find(iconProperty => {
          return iconProperty.subclass === subClassName && !iconProperty.class;
        });
      }

      // Or: matching class and no subclass
      if (!icon) {
        icon = icons.find(iconProperty => {
          return iconProperty.class === className && !iconProperty.subclass;
        });
      }

      if (icon) {
        const iconName = icon.iconName;
        const color = icon.color;
        const iconClass = nameToClass(iconName);
        return { iconClass, color };
      }

      return {
        iconClass: nameToClass(styleIcons.defaultIcon),
        color: styleIcons.defaultColor,
      };

    // Get the icon of a location / area that is not a PoI:
    // Exact address
    } else if (type === 'house' || type === 'address') {
      return {
        iconClass: nameToClass(styleIcons.defaultAddressIcon),
        color: styleIcons.defaultAddressColor,
      };

    // Road / street without house number
    } else if (type === 'street') {
      return {
        iconClass: nameToClass(styleIcons.defaultStreetIcon),
        color: styleIcons.defaultStreetColor,
      };

    // user geolocation "poi"
    } else if (type === 'geoloc') {
      return {
        iconClass: 'pin_geoloc',
        color: '#1050c5', // action-blue-dark
        icomoon: true,
      };

      // administrative zones (city, area, country)
    } else {
      return {
        iconClass: nameToClass(styleIcons.defaultAdministrativeIcon),
        color: styleIcons.defaultAdministrativeColor,
      };
    }
  }
}

export function createIcon(iconOptions) {
  const icon = IconManager.get(iconOptions);

  // Show a white circle instead of marker2 in map markers of PoI that have no class or subclass.
  if (icon.iconClass === nameToClass(styleIcons.defaultIcon)) {
    icon.iconClass = 'circle';
  }

  const element = document.createElement('div');
  element.innerHTML = `
    <div
      class="marker ${iconOptions.className || ''}"
      ${iconOptions.disablePointerEvents && 'style="pointer-events:none;"'}
    >
      <div class="marker-container">
        <i class="icon icon-${icon.iconClass}"></i>
      </div>
    </div>
  `;
  return element.firstElementChild;
}

export function createMapGLIcon(imageFile, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image(width, height);
    img.onload = () => { resolve(img); };
    img.onerror = reject;
    img.src = imageFile;
  });
}

export function createPinIcon({ className, disablePointerEvents }) {
  const element = document.createElement('div');
  element.className = classnames('marker', className);
  if (disablePointerEvents) {
    element.style = 'pointer-events:none;';
  }
  return element;
}
