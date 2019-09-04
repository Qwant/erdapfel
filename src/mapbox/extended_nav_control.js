import ExtendedScaleControl from './extended_scale_control';
import ExtendedAttributionControl from './extended_attribution_control';

import GeolocControl from './extended_geolocate_control';

export default class ExtendedControl {
  constructor() {
    this._container = document.createElement('div');
    this.topButtonGroup = document.createElement('div');
    this.bottomButtonGroup = document.createElement('div');

    const buttonClass = 'icon-plus map_control_group__button map_control_group__button__zoom';
    this._zoomInButton = this._createButton(buttonClass, 'Zoom In', () => this._map.zoomIn());
    this._zoomOutButton = this._createButton(
      'icon-minus map_control_group__button map_control_group__button__zoom',
      'Zoom Out',
      () => this._map.zoomOut(),
    );

    const compassClass = 'map_control_group__button map_control_group__button__compass';
    this._compass = this._createButton(compassClass, 'Reset North', () => {
      this._resetNorthAndTilt();
    });
    this._direction = this._createButton('direction_shortcut icon-corner-up-right', 'direction',
      ev => {
        ev.target.style.display = 'none';
        window.app.navigateTo('/routes');
        fire("move_mobile_bottom_ui", 0);}
    );

    this._compassIndicator = this._createIcon('map_control__compass__icon');
    this._compass.appendChild(this._compassIndicator);
  }

  onAdd(map) {
    this._map = map;
    this.topButtonGroup.className = 'map_control_group';
    this.topButtonGroup.textContent = '';
    this.bottomButtonGroup.className = 'map_control_group map_bottom_button_group';
    this.bottomButtonGroup.textContent = '';

    const geolocControl = new GeolocControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    }, this.bottomButtonGroup);

    this.topButtonGroup.appendChild(this._compass);
    this.topButtonGroup.appendChild(this._direction);

    geolocControl.onReady(() => {
      this.bottomButtonGroup.appendChild(this._zoomInButton);
      this.bottomButtonGroup.appendChild(this._zoomOutButton);
    });

    this._map.addControl(geolocControl);

    const _pitchAndRotateCompassArrow = this._pitchAndRotateCompassArrow.bind(this);

    _pitchAndRotateCompassArrow();

    this._map.on('rotate', _pitchAndRotateCompassArrow);
    this._map.on('pitch', _pitchAndRotateCompassArrow);

    this.scaleAttributionContainer = document.createElement('div');
    this.scaleAttributionContainer.className = 'map_control__scale_attribute_container';
    this._container.appendChild(this.scaleAttributionContainer);

    const extendedScaleControl = new ExtendedScaleControl({
      unit: 'metric',
    }, this.scaleAttributionContainer);

    const extendedAttributionControl = new ExtendedAttributionControl(
      {},
      this.scaleAttributionContainer,
    );
    this._container.appendChild(this.topButtonGroup);
    this._container.appendChild(this.bottomButtonGroup);


    this._container.appendChild(this.scaleAttributionContainer);
    this._map.addControl(extendedScaleControl, 'bottom-right');
    this._map.addControl(extendedAttributionControl, 'bottom-right');
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }

  _createButton(className, ariaLabel, fn) {
    const a = document.createElement('button');
    a.setAttribute('class', className);
    a.setAttribute('aria-label', ariaLabel);
    a.addEventListener('click', fn);
    return a;
  }

  _createIcon(className) {
    const a = document.createElement('span');
    a.setAttribute('class', className);
    return a;
  }

  _resetNorthAndTilt() {
    this._map.easeTo({ pitch: 0, bearing: 0 });
  }

  _pitchAndRotateCompassArrow() {
    if (this._map.getPitch() === 0 && this._map.transform.angle === 0) {
      this._compass.classList.add('compass-origin');
    } else {
      this._compass.classList.remove('compass-origin');
    }
    const scale = 1 - this._map.getPitch() / 110;
    const rotation = this._map.transform.angle * (180 / Math.PI);
    this._compassIndicator.style.transform = `scale(1, ${scale}) rotate(${rotation}deg)`;
  }
}
