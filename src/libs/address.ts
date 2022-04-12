import { components } from 'appTypes/idunn';

type BragiRaw = components['schemas']['FeatureProperties'];
type IdunnRaw = components['schemas']['Place'];

export type NormalizedAddress = {
  street?: string;
  suburb?: string;
  cityDistrict?: string;
  city?: string;
  postcode?: string;
  stateDistrict?: string;
  state?: string;
  countryRegion?: string;
  country?: string;
  label?: string;
};

/**
 * Find administrative field inside a poi from Bragi
 */
const findAdminBragi = (raw: components['schemas']['FeatureProperties'], name: string) => {
  return Object.values(raw.geocoding.administrative_regions).find(a => a.zone_type === name);
};

/**
 * Find administrative field inside a poi from Idunn
 */
const findAdminIdunn = (raw: components['schemas']['Place'], name: string) => {
  return Object.values(raw.address?.admins || {}).find(a => a.class_name === name);
};

/**
 * Filter an address and return an array with the relevant items
 */
export const toArray = (
  address: NormalizedAddress,
  { omitStreet, omitCountry }: { omitStreet?: boolean; omitCountry?: boolean } = {}
): string[] => {
  if (!address.street) {
    // Tripadvisor POI only have a valid address in the label field
    if (!address.cityDistrict && !address.countryRegion && !address.suburb && address.label) {
      return [address.label];
    }
    return [
      address.suburb,
      address.cityDistrict,
      address.city,
      address.stateDistrict,
      address.state,
      address.countryRegion,
      !omitCountry && address.country,
    ]
      .filter(i => i)
      .filter((item, pos, arr) => pos === 0 || item !== arr[pos - 1]) as string[]; // remove consecutive duplicated name
  }

  const cityAndPostcode =
    address.postcode && address.city ? address.postcode + ' ' + address.city : address.city;

  return [!omitStreet && address.street, cityAndPostcode, !omitCountry && address.country].filter(
    i => i
  ) as string[]; // Filter out any undefined value
};

/**
 * Normalize an address from a raw poi
 */
export const normalize = (
  type: 'bragi' | 'idunn',
  raw: BragiRaw | IdunnRaw
): NormalizedAddress | null => {
  if (type === 'bragi') {
    const bragiRaw = raw as BragiRaw;
    let street = bragiRaw.geocoding.address?.name;
    if (bragiRaw.geocoding.type === 'house' || bragiRaw.geocoding.type === 'street') {
      // Street address is received in the name field
      street = bragiRaw.geocoding.name;
    }

    return {
      street,
      suburb: findAdminBragi(bragiRaw, 'suburb')?.name,
      cityDistrict: findAdminBragi(bragiRaw, 'city_district')?.name,
      city: findAdminBragi(bragiRaw, 'city')?.name,
      postcode: bragiRaw.geocoding.address?.postcode,
      stateDistrict: findAdminBragi(bragiRaw, 'state_district')?.name,
      state: findAdminBragi(bragiRaw, 'state')?.name,
      countryRegion: findAdminBragi(bragiRaw, 'country_region')?.name,
      country: findAdminBragi(bragiRaw, 'country')?.name,
      label: bragiRaw.geocoding.address?.label,
    };
  }

  if (type === 'idunn') {
    const idunnRaw = raw as IdunnRaw;
    return {
      street: idunnRaw.address?.name,
      suburb: findAdminIdunn(idunnRaw, 'suburb')?.name,
      cityDistrict: findAdminIdunn(idunnRaw, 'city_district')?.name,
      city: findAdminIdunn(idunnRaw, 'city')?.name,
      postcode: idunnRaw.address?.postcode,
      stateDistrict: findAdminIdunn(idunnRaw, 'state_district')?.name,
      state: findAdminIdunn(idunnRaw, 'state')?.name,
      countryRegion: findAdminIdunn(idunnRaw, 'country_region')?.name,
      country: findAdminIdunn(idunnRaw, 'country')?.name,
      label: idunnRaw.address?.label || idunnRaw.address?.admin?.label,
    };
  }

  return null;
};
