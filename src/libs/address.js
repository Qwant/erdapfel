import IdunnPoi from 'src/adapters/poi/idunn_poi';

/**
 * Format an address given a name, city, and country
 * @param {*} name - can be either a poi'name or street address for instance
 * @param {*} city
 * @param {*} country
 */
function formatAddress(name, city, country) {
  return [name, city, country]
    .filter(i => i) // Filter out any undefined value
    .join(', ');
}

/**
 * Get a human readable address formatted as "name, city, country"
 * @param {poi} poi
 */
export function getAddress(poi) {
  let name = poi.name;
  if (poi.type === 'latlon' ) {
    // name is not human friendly, so use the street addess instead
    name = poi.address?.street;
  }
  return formatAddress(name, poi.address?.city, poi.address?.country);
}

/**
 * Get a street address, formatted as "street, city, country"
 * @param {*} poi
 */
export function getStreetAddress(poi) {
  return formatAddress(poi.address?.street, poi.address?.city, poi.address?.country);
}

/**
 * Fetch an address from idunn given a raw poi
 * @param {*} poi - the poi to fetch address for
 */
export async function fetchAddress(poi) {
  return poi.address || (await IdunnPoi.poiApiLoad(poi)).address;
}

/**
 * Find administrative field inside a poi from Bragi
 * @param {*} raw - the raw poi object
 * @param {*} name - the administrative field to find
 */
const findAdminBragi = (raw, name) => {
  return Object
    .values(raw.administrative_regions)
    .find(a => a.zone_type === name);
};

/**
 * Find administrative field inside a poi from Idunn
 * @param {*} raw - the raw poi object
 * @param {*} name - the administrative field to find
 */
const findAdminIdunn = (raw, name) => {
  return Object
    .values(raw.address?.admins || {})
    .find(a => a.class_name === name);
};

/**
 * Normalize an address from a raw poi
 * @param {*} type - "bragi" or "idunn"
 * @param {*} raw - the raw poi object
 */
export function normalizeAddress(type, raw) {
  if (type === 'bragi') {
    let street = raw.address?.name;
    if (raw.type === 'house') {
      // Street address is received in the name field
      street = raw.name;
    }

    return {
      street,
      city: findAdminBragi(raw, 'city')?.name,
      country: findAdminBragi(raw, 'country')?.name,
      label: raw.label,
    };
  }

  if (type === 'idunn') {
    return {
      street: raw.address?.name,
      city: findAdminIdunn(raw, 'city')?.name,
      country: findAdminIdunn(raw, 'country')?.name,
      label: raw.address?.label || raw.address?.admin?.label,
    };
  }

  return null;
}
