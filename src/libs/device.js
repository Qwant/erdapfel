export const MOBILE_THRESHOLD = 640

export default class Device {
  /**
   * return if device is mobile according to the viewport width
   */
  static isMobile() {
    return window.innerWidth < MOBILE_THRESHOLD
  }
}
