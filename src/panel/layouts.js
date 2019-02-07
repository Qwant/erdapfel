import Device from "../libs/device";

export const layouts = {
  POI_CARD : 'poi_card',
  ITINERARY_CARD : 'itinerary_card',
  FULL_PANEL : 'full_panel',
  FULL_WINDOW : 'full_window'
}

const paddings = {
  mobileNoPadding : {top: 80, right: 70, bottom: 45, left: 20 },
  mobileTopCard : {top: 184, right: 70, bottom: 45, left: 20 },
  mobileBottomCard : {top: 80, right: 70, bottom: 130, left: 20 },
  mobilePanel : {top: 184, right: 70, bottom: 130, left: 20 },
  desktopNoPadding : {top: 100, left: 20, right: 60, bottom: 45},
  desktopSidePanel : {top: 100, left: 450, right: 60, bottom: 45}
}

export default class PanelLayout {
  static getLayout(layout) {
    if(Device.isMobile()) {
      switch (layout) {
        case layouts.POI_CARD:
          return paddings.mobileBottomCard
        case layout.ITINERARY_CARD:
          return paddings.mobileTopCard
        case layout.FULL_PANEL:
          return paddings.mobilePanel
        case layout.FULL_WINDOW:
          return paddings.mobileNoPadding
      }
    } else {
      switch (layout) {
        case layouts.FULL_PANEL:
          return paddings.desktopSidePanel
        case layout.FULL_WINDOW:
          return paddings.desktopNoPadding
      }
    }
  }
}
