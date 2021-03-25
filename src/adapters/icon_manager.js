import { getPoiIcon } from '@qwant/qwant-basic-gl-style';
import classnames from 'classnames';
import { ACTION_BLUE_DARK } from 'src/libs/colors';

export default class IconManager {
  static get({ className, subClassName, type }) {
    if (type === 'geoloc') {
      return {
        iconClass: 'pin_geoloc',
        color: ACTION_BLUE_DARK,
        icomoon: true,
      };
    }

    return getPoiIcon({ className, subClassName, type });
  }
}

export function createDefaultPin() {
  const element = document.createElement('div');
  element.innerHTML = `
    <div class="marker">
      <div class="marker-container">
        <i class="icon icon-circle"></i>
      </div>
    </div>
  `;
  return element.firstElementChild;
}

export function createMapGLIcon(imageFile, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image(width, height);
    img.onload = () => {
      resolve(img);
    };
    img.onerror = reject;
    img.src = imageFile;
  });
}

export function createPinIcon({ className, disablePointerEvents }) {
  const element = document.createElement('div');
  element.className = classnames('marker', className);
  if (disablePointerEvents) {
    element.style.pointerEvents = 'none';
  }
  return element;
}
