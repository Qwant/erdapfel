export interface Geocoder {
  url: string;
  useLang: boolean;
  maxItems: number;
  useFocus: boolean;
  focusPrecision: string;
  focusZoomPrecision: string;
  focusMinZoom: number;
  useNlu: boolean;
}

export interface Idunn {
  url: string;
}

export interface Services {
  geocoder: Geocoder;
  idunn: Idunn;
}

export interface System {
  baseUrl: string;
  timeout: number;
}

export interface MapStyle {
  baseMapUrl: string;
  poiMapUrl: string;
  spritesUrl: string;
  fontsUrl: string;
  maxAge: string;
  showNamesWithPins: boolean;
}

export interface MapPlugins {
  maxAge: string;
}

export interface Statics {
  maxAge: number;
}

export interface BurgerMenu {
  enabled: boolean;
  products: boolean;
}

export interface Performance {
  enabled: boolean;
}

export interface Telemetry {
  enabled: boolean;
  sendQueryContextHeaders: boolean;
}

export interface Service {
  api: string;
  apiBaseUrl: string;
  token: string;
}

export interface PublicTransport {
  enabled: boolean;
}

export interface Direction {
  enabled: boolean;
  timeout: number;
  service: Service;
  publicTransport: PublicTransport;
}

export interface Category {
  maxPlaces: number;
  enabled: boolean;
}

export interface Events {
  enabled: boolean;
  maxPlaces: number;
}

export interface Covid19 {
  enabled: boolean;
  frInformationUrl: string;
}

export interface UserFeedback {
  enabled: boolean;
  dismissDurationDays: number;
}

export interface SearchHistory {
  enabled: string;
}

export interface Survey {
  surveyApiUrl: string;
}

export interface QmapsConfig {
  PORT: number;
  envName: string;
  services: Services;
  system: System;
  mapStyle: MapStyle;
  mapPlugins: MapPlugins;
  statics: Statics;
  burgerMenu: BurgerMenu;
  performance: Performance;
  telemetry: Telemetry;
  direction: Direction;
  category: Category;
  events: Events;
  covid19: Covid19;
  userFeedback: UserFeedback;
  searchHistory: SearchHistory;
  survey: Survey;
  testGroupPer: number;
  compilationHash: string;
}
