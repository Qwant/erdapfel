import Device from "../libs/device";

// Mapbox paddings mobile / desktop
export const layouts = {
    FULL: Device.isMobile() ?       {top: 80,  right: 70, bottom: 45,  left: 20 }   : {top: 100, left: 20,  right: 60, bottom: 45},
    FAVORITE: Device.isMobile() ?   {top: 80,  right: 70, bottom: 130, left: 20 }   : {top: 100, left: 450, right: 60, bottom: 45},
    POI: Device.isMobile() ?        {top: 80,  right: 70, bottom: 130, left: 20 }   : {top: 100, left: 450, right: 60, bottom: 45},
    ITINERARY: Device.isMobile() ?  {top: 184, right: 70, bottom: 130, left: 20 }   : {top: 100, left: 450, right: 60, bottom: 45}
};