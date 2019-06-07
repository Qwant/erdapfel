module.exports = {
  events : [
    /* App */
    'app_start',
    /* Favorite */
    'favorite_open',
    'favorite_close',
    'favorite_url_restore',
    'favorite_go',
    'favorite_share',
    'favorite_save',
    'favorite_delete',
    'favorite_open_more',
    'favorite_error_load_all', //error
    /* Itinerary */
    'itinerary_open',
    'itinerary_close',
    'itinerary_share',
    'itinerary_invert',
    'itinerary_mode_driving',
    'itinerary_mode_walking',
    'itinerary_mode_cycling',
    /* Poi */
    'poi_category_open',
    'poi_backtofavorite',
    'poi_backtolist',
    'poi_restore',
    'poi_hour_extend',
    'poi_osm_open',
    'poi_osm_close',
    'poi_osm_go',
    'poi_osm_favorite',
    'poi_osm_share',
    'poi_osm_phone',
    'poi_information_extend',
    'poi_error_load', // error
    'poi_see_more',
    /* Pages Jaunes Poi */
    'poi_pages_jaunes_open',
    'poi_pages_jaunes_close',
    'poi_pages_jaunes_go',
    'poi_pages_jaunes_favorite',
    'poi_pages_jaunes_share',
    'poi_pages_jaunes_phone',
    /* Map */
    'localise_trigger'
  ]
}