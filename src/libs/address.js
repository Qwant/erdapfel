import IdunnPoi from '../adapters/poi/idunn_poi';

/**
 * Format an address given an address object (name, city, country, and label)
 * @param {*} address - an address object
 */
export function format(address) {
  if (!address) {return '';}
  const { street, city, country } = address;
  return [street, city, country]
    .filter(i => i) // Filter out any undefined value
    .join(', ');
}

/**
 * Fetch an address from idunn given a raw poi
 * @param {*} poi - the poi to fetch address for
 */
export async function fetch(poi) {
  const idunnPoi = await IdunnPoi.poiApiLoad(poi);
  return idunnPoi.address;
}

/**
 * Normalize an address from a raw poi
 * @param {*} type - "bragi" or "idunn"
 * @param {*} raw - the raw poi object
 */
export function normalize(type, raw) {
  if (type === 'bragi') {
    let street = raw.geocoding.address?.name || raw.geocoding.name;
    if (raw.type === 'house') {
      // Street address is received in the name field
      street = raw.geocoding.name;
    }

    return {
      street,
      city: findAdminBragi(raw, 'city')?.name,
      country: findAdminBragi(raw, 'country')?.name,
      label: raw.geocoding.address?.label,
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

/**
 * Find administrative field inside a poi from Bragi
 * @param {*} raw - the raw poi object
 * @param {*} name - the administrative field to find
 */
function findAdminBragi(raw, name) {
  return Object
    .values(raw.geocoding.administrative_regions)
    .find(a => a.zone_type === name);
}

/**
 * Find administrative field inside a poi from Idunn
 * @param {*} raw - the raw poi object
 * @param {*} name - the administrative field to find
 */
function findAdminIdunn(raw, name) {
  return Object
    .values(raw.address?.admins || {})
    .find(a => a.class_name === name);
}
