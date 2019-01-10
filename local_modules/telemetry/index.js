module.exports = {
  events : [
    /* App */
    'app_start',
    /* Favorite */
    'favorite_open',
    'favorite_url_restore',
    'favorite_go',
    'favorite_share',
    'favorite_save',
    'favorite_delete',
    'favorite_open_more',
    'favorite_error_load_all', //error
    /* Itinerary */
    'itinerary_open',
    /* Poi */
    'poi_open',
    'poi_restore',
    'poi_hour_extend',
    'poi_go',
    'poi_share',
    'poi_information_extend',
    'poi_error_load', // error
    /* Map */
    'localise_trigger'
  ]
}