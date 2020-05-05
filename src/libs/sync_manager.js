import { listen } from 'src/libs/customEvents';

/**
 Call this function to schedule other functions
 after mapbox Map is loaded.
 It will be overriden on mapbox 'load' event
*/
window.execOnMapLoaded = function(f) {
  listen('map_loaded', function() {
    f.call();
  });
};
