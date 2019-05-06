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
    'poi_close',
    'poi_backtofavorite',
    'poi_backtolist',
    'poi_open',
    'poi_restore',
    'poi_hour_extend',
    'poi_go',
    'poi_favorite',
    'poi_share',
    'poi_phone',
    'poi_information_extend',
    'poi_error_load', // error
    /* Pages Jaunes Poi */
    'poi_pj_category_open',
    'poi_pj_open',
    'poi_pj_go',
    'poi_pj_favorite',
    'poi_pj_share',
    'poi_pj_phone',
    /* Map */
    'localise_trigger'
  ]
}