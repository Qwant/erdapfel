import IdunnPoi from '../adapters/poi/idunn_poi';

/**
 * Fetch an address from idunn given a raw poi
 * @param {*} poi - the poi to fetch address for
 */
export async function fetch(poi) {
  const idunnPoi = await IdunnPoi.poiApiLoad(poi);
  return idunnPoi.address;
}
