/**
 Call this function to schedule other functions
 after mapbox Map is loaded.
 It will be overriden on mapbox 'load' event
*/
window.execOnMapLoaded = (f) => {
  listen('map_loaded', () => f())
}
