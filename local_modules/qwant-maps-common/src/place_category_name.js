import { gettext, _ } from './gettext';

const subClasses = {
  accessories: () => _('accessories shop'),
  airport: () => _('airport'),
  alcohol: () => _('liquor store'),
  alpine_hut: () => _('alpine hut'),
  antiques: () => _('antiques shop'),
  aquarium: () => _('aquarium'),
  archery: () => _('archery'),
  art: () => _('art shop'),
  arts_centre: () => _('arts centre'),
  athletics: () => _('athletics'),
  atm: () => _('ATM'),
  attraction: () => _('attraction'),
  bag: () => _('bag shop'),
  bakery: () => _('bakery'),
  bank: () => _('bank'),
  bar: () => _('bar'),
  basin: () => _('basin'),
  basketball: () => _('basketball'),
  bbq: () => _('bbq'),
  beauty: () => _('beauty salon'),
  beekeeper: () => _('beekeeper'),
  bed: () => _('bed shop'),
  bed_and_breakfast: () => _('bed and breakfast'),
  beverages: () => _('beverages shop'),
  bicycle: () => _('bicycle shop'),
  bicycle_parking: () => _('bicycle parking'),
  biergarten: () => _('biergarten'),
  billiards: () => _('billiards'),
  bleachers: () => _('bleachers'),
  bmx: () => _('bmx'),
  books: () => _('books shop'),
  border_control: () => _('border control'),
  boules: () => _('boules'),
  boutique: () => _('boutique'),
  bowls: () => _('bowls'),
  brewery: () => _('brewery'),
  brownfield: () => _('brownfield'),
  bus_station: () => _('bus station'),
  bus_stop: () => _('bus stop'),
  butcher: () => _('butcher'),
  cafe: () => _('cafe'),
  camp_site: () => _('camp site'),
  canoe: () => _('canoe'),
  car: () => _('car shop'),
  car_parts: () => _('car parts shop'),
  car_repair: () => _('car repair'),
  car_rental: () => _('car rental'),
  car_wash: () => _('car wash station'),
  caravan_site: () => _('caravan site'),
  carpenter: () => _('carpenter'),
  carpet: () => _('carpet shop'),
  castle: () => _('castle'),
  caterer: () => _('catering'),
  cemetery: () => _('cemetery'),
  chalet: () => _('holiday cottage'),
  charging_station: () => _('charging station'),
  charity: () => _('charity store'),
  chemist: () => _('chemist'),
  cheese: () => _('cheese shop'),
  chess: () => _('chess'),
  childcare: () => _('childcare centre'),
  chocolate: () => _('chocolate shop'),
  cinema: () => _('cinema'),
  climbing: () => _('climbing'),
  climbing_adventure: () => _('climbing adventure'),
  clinic: () => _('clinic'),
  clothes: () => _('clothes shop'),
  coffee: () => _('coffee shop'),
  college: () => _('college'),
  community_centre: () => _('community centre'),
  computer: () => _('computer shop'),
  confectionery: () => _('confectionery shop'),
  container: () => _('recycling container'),
  convenience: () => _('convenience store'),
  copyshop: () => _('copyshop'),
  cosmetics: () => _('cosmetics shop'),
  courthouse: () => _('courthouse'),
  coworking_space: () => _('coworking space'),
  cricket: () => _('cricket'),
  cycling: () => _('cycling'),
  deli: () => _('deli'),
  dentist: () => _('dentist'),
  department_store: () => _('department store'),
  disc_golf_course: () => _('disc golf course'),
  dock: () => _('dock'),
  doctors: () => _('doctors office'),
  dog_park: () => _('dog park'),
  dog_toilet: () => _('dog toilet'),
  dog_racing: () => _('dog racing'),
  doityourself: () => _('doityourself store'),
  dojo: () => _('dojo'),
  driving_school: () => _('driving school'),
  dry_cleaning: () => _('dry cleaning'),
  electronics: () => _('electronics shop'),
  embassy: () => _('embassy'),
  equestrian: () => _('equestrian'),
  erotic: () => _('erotic shop'),
  escape_game: () => _('escape game'),
  estate_agent: () => _('estate agent'),
  fabric: () => _('fabric'),
  farm: () => _('farm shop'),
  fast_food: () => _('fast food'),
  fire_station: () => _('fire station'),
  fitness_centre: () => _('fitness centre'),
  fitness_station: () => _('fitness station'),
  florist: () => _('florist'),
  food_court: () => _('food court'),
  free_flying: () => _('free flying'),
  frozen_food: () => _('frozen food'),
  fuel: () => _('fuel station'),
  funeral_directors: () => _('funeral home'),
  furniture: () => _('furniture shop'),
  gallery: () => _('gallery'),
  garden: () => _('garden'),
  garden_centre: () => _('garden centre'),
  general: () => _('general store'),
  gift: () => _('gift shop'),
  golf: () => _('golf'),
  golf_course: () => _('golf course'),
  grave_yard: () => _('grave yard'),
  greengrocer: () => _('greengrocer'),
  guest_house: () => _('guest house'),
  gymnastics: () => _('gymnastics'),
  hackerspace: () => _('hackerspace'),
  hairdresser: () => _('hairdresser'),
  halt: () => _('halt'),
  hardware: () => _('hardware shop'),
  hearing_aids: () => _('hearing aids shop'),
  hifi: () => _('hifi shop'),
  horse_racing: () => _('horse racing'),
  hospital: () => _('hospital'),
  hostel: () => _('hostel'),
  hotel: () => _('hotel'),
  houseware: () => _('houseware shop'),
  ice_cream: () => _('ice cream'),
  ice_rink: () => _('ice rink'),
  interior_decoration: () => _('interior decoration shop'),
  jewelry: () => _('jewelry shop'),
  karting: () => _('karting'),
  kindergarten: () => _('kindergarten or preschool'),
  kiosk: () => _('kiosk'),
  kitchen: () => _('kitchen manufacturer'),
  lamps: () => _('lamps shop'),
  laundry: () => _('laundry'),
  left_luggage: () => _('left luggage'),
  library: () => _('library'),
  lodging: () => _('hotel'),
  long_jump: () => _('long jump'),
  mall: () => _('mall'),
  marina: () => _('marina'),
  marketplace: () => _('marketplace'),
  massage: () => _('massage shop'),
  miniature_golf: () => _('miniature golf'),
  mobile_phone: () => _('mobile phone shop'),
  model_aerodrome: () => _('model aerodrome'),
  monument: () => _('monument'),
  motel: () => _('motel'),
  motocross: () => _('motocross'),
  motor: () => _('motor'),
  motorcycle: () => _('motorcycle shop'),
  motorcycle_parking: () => _('motorcycle parking'),
  multi: () => _('multi'),
  museum: () => _('museum'),
  music: () => _('music shop'),
  music_school: () => _('music school'),
  musical_instrument: () => _('musical instrument shop'),
  newsagent: () => _('newsagent shop'),
  nightclub: () => _('nightclub'),
  nursing_home: () => _('nursing home'),
  optician: () => _('optician'),
  orienteering: () => _('orienteering'),
  outdoor: () => _('outdoor'),
  paragliding: () => _('paragliding'),
  park: () => _('park'),
  parking: () => _('car park'),
  pastry: () => _('pastry shop'),
  perfumery: () => _('perfumery'),
  pet: () => _('pet store'),
  pharmacy: () => _('pharmacy'),
  photo: () => _('photo shop'),
  picnic_site: () => _('picnic site'),
  place_of_worship: () => _('place of worship'),
  plumber: () => _('plumber'),
  police: () => _('police'),
  polling_station: () => _('polling station'),
  post_office: () => _('post office'),
  post_pickup: () => _('parcel pickup'),
  prison: () => _('prison'),
  pub: () => _('pub'),
  public_building: () => _('public building'),
  public_bookcase: () => _('public bookcase'),
  rc_car: () => _('rc car'),
  recycling: () => _('recycling'),
  reservoir: () => _('reservoir'),
  restaurant: () => _('restaurant'),
  rowing: () => _('rowing'),
  ruins: () => _('ruins'),
  running: () => _('running'),
  sailing: () => _('sailing'),
  school: () => _('school'),
  scuba_diving: () => _('scuba diving'),
  seafood: () => _('fishmonger'),
  second_hand: () => _('resale shop'),
  shelter: () => _('shelter'),
  shoemaker: () => _('shoemaker'),
  shoes: () => _('shoes'),
  shooting: () => _('shooting'),
  skateboard: () => _('skateboard'),
  skating: () => _('skating'),
  skiing: () => _('skiing'),
  soccer: () => _('soccer'),
  sports: () => _('sports shop'),
  sports_centre: () => _('sports centre'),
  sports_hall: () => _('sports hall'),
  stadium: () => _('stadium'),
  station: () => _('station'),
  stationery: () => _('stationery shop'),
  subway: () => _('subway'),
  supermarket: () => _('supermarket'),
  swimming: () => _('swimming pool'), // leisure=sports_centre + sport=swimming
  swimming_area: () => _('swimming area'),
  swimming_pool: () => _('swimming pool equipment'), // shop=swimming_pool
  table_tennis: () => _('table tennis'),
  tailor: () => _('tailor'),
  tattoo: () => _('tattoo salon'),
  tennis: () => _('tennis'),
  theatre: () => _('theatre'),
  theme_park: () => _('theme park'),
  ticket: () => _('ticket shop'),
  tobacco: () => _('tobacco shop'),
  toll_booth: () => _('toll booth'),
  townhall: () => _('townhall'),
  toys: () => _('toys shop'),
  tram_stop: () => _('tram stop'),
  travel_agency: () => _('travel agency'),
  university: () => _('university'),
  vacuum_cleaner: () => _('vacuum cleaner'),
  variety_store: () => _('variety store'),
  vehicle_inspection: () => _('vehicle inspection'),
  veterinary: () => _('veterinary'),
  video: () => _('videos shop'),
  video_games: () => _('video games shop'),
  viewpoint: () => _('viewpoint'),
  volleyball: () => _('volleyball'),
  watches: () => _('watches shop'),
  water_park: () => _('water park'),
  weapons: () => _('weapons shop'),
  wholesale: () => _('warehouse club'),
  wine: () => _('wine shop'),
  winery: () => _('winery'),
  winter_sports: () => _('winter sports resort'),
  yoga: () => _('yoga'),
  zoo: () => _('zoo'),

  city: () => _('city'),
  country: () => _('country'),
  address: () => _('address'),
  street: () => _('street'),
};

function getPlaceCategoryName({ subclass }, lang) {
  if (subClasses[subclass]) {
    gettext.setLang(lang);
    return subClasses[subclass]();
  }
  return '';
}

export { getPlaceCategoryName };
