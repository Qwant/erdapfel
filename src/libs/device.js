import React from 'react';

export const MOBILE_THRESHOLD = 640;

export default class Device {
  /**
   * return if device is mobile according to the viewport width
   */
  static isMobile() {
    return window.innerWidth < MOBILE_THRESHOLD;
  }
}

export const DeviceContext = React.createContext({ isMobile: Device.isMobile() });
