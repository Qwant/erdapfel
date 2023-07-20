import React from 'react';
import ExtendedScaleControl from './extended_scale_control';
import ExtendedAttributionControl from './extended_attribution_control';
import GeolocControl from './extended_geolocate_control';
import ExtendedTerrainControl from './extended_terrain_control';
import Telemetry from 'src/libs/telemetry';
import { listen, unListen } from '../libs/customEvents';
import renderStaticReact from 'src/libs/renderStaticReact';
import { IconPlus, IconMinus } from 'src/components/ui/icons';

export default class ExtendedControl {
  constructor() {
    this._container = document.createElement('div');
    this.topButtonGroup = document.createElement('div');
    this.bottomButtonGroup = document.createElement('div');

    // Store a callback to trigger when direction shortcut is clicked.
    // if no callback is registered, then the default action will be executed
    // (navigate to /routes)
    this.directionShortcutCallback = null;
    listen('set_direction_shortcut_callback', cb => (this.directionShortcutCallback = cb));

    this._zoomInButton = this._createButton(
      'map_control_group__button__zoom map-button--zoomIn',
      'Zoom +',
      () => {
        Telemetry.add(Telemetry.MAP_ZOOM_IN);
        this._map.zoomIn();
      }
    );
    this._zoomInButton.innerHTML = renderStaticReact(<IconPlus fill="currentColor" width={16} />);

    this._zoomOutButton = this._createButton(
      'map_control_group__button__zoom map-button--zoomOut',
      'Zoom -',
      () => {
        Telemetry.add(Telemetry.MAP_ZOOM_OUT);
        this._map.zoomOut();
      }
    );
    this._zoomOutButton.innerHTML = renderStaticReact(<IconMinus fill="currentColor" width={16} />);

    const compassClass = 'map_control_group__button__compass';
    this._compass = this._createButton(compassClass, 'Reset North', () => {
      this._resetNorthAndTilt();
    });
    this._direction = this._createButton('direction_shortcut hidden', 'direction', () => {
      Telemetry.add(Telemetry.MAP_ITINERARY);
      this.directionShortcutCallback
        ? this.directionShortcutCallback()
        : window.app.navigateTo('/routes'); // default action, if no cb has been set
    });

    this._compassIndicator = this._createIcon('map_control__compass__icon');
    this._compass.appendChild(this._compassIndicator);
  }

  onAdd(map) {
    this._map = map;
    this.topButtonGroup.className = 'map_control_group';
    this.topButtonGroup.textContent = '';
    this.bottomButtonGroup.className = 'map_control_group map_bottom_button_group maplibregl-ctrl';
    this.bottomButtonGroup.textContent = '';

    const geolocControl = new GeolocControl(
      {
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showAccuracyCircle: false,
      },
      this.bottomButtonGroup
    );

    this.topButtonGroup.appendChild(this._compass);
    this.topButtonGroup.appendChild(this._direction);

    geolocControl.onReady(() => {
      this.bottomButtonGroup.appendChild(this._zoomInButton);
      this.bottomButtonGroup.appendChild(this._zoomOutButton);
    });

    const terrainControl = new ExtendedTerrainControl(
      {
        source: 'terrainSource',
        exaggeration: 1,
      },
      this.bottomButtonGroup,
      this._map
    );

    this._map.addControl(geolocControl);
    this._map.addControl(terrainControl);
    const _pitchAndRotateCompassArrow = this._pitchAndRotateCompassArrow.bind(this);

    _pitchAndRotateCompassArrow();

    this._map.on('rotate', _pitchAndRotateCompassArrow);
    this._map.on('pitch', _pitchAndRotateCompassArrow);

    this.scaleAttributionContainer = document.createElement('div');
    this.scaleAttributionContainer.className = 'map_control__scale_attribute_container';
    this._container.appendChild(this.scaleAttributionContainer);

    const extendedScaleControl = new ExtendedScaleControl(
      {
        unit: 'metric',
      },
      this.scaleAttributionContainer
    );

    const extendedAttributionControl = new ExtendedAttributionControl(
      {},
      this.scaleAttributionContainer
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
    unListen('set_direction_shortcut_callback');
  }

  _createButton(className, ariaLabel, fn) {
    const a = document.createElement('button');
    a.setAttribute('class', className);
    a.setAttribute('aria-label', ariaLabel);
    a.setAttribute('title', ariaLabel);
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
