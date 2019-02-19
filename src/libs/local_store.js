import Error from '../adapters/error'
import {version} from '../../config/constants.yml'

export default class LocalStore {

  async getAllPois() {
    let localStorageKeys = []
    try {
      localStorageKeys = Object.keys(localStorage)
    } catch (e) {
      Error.sendOnce('local_store', 'getAllPois', 'error getting pois keys', e)
      return []
    }
    const items = localStorageKeys.reduce((filtered, k) => {
      if (Poi.isPoiCompliantKey(k)) {
        try {
          let poi = JSON.parse(localStorage.getItem(k))
          filtered.push(poi)
        } catch (e) {
          Error.sendOnce('local_store', 'getAllPois', 'error getting pois', e)
        }
      }
      return filtered
    }, [])
    return items
  }

  getLastLocation() {
    return this.get(`qmaps_v${version}_last_location`)
  }

  setLastLocation(loc) {
   return this.set(`qmaps_v${version}_last_location`, loc)
  }

  async has(k) {
    return Boolean(await this.get(k))
  }

  async get(k) {
    try {
      return JSON.parse(localStorage.getItem(k))
    } catch (e) {
      Error.sendOnce('local_store', 'get', `error parsing item with key ${k}`, e)
      return null
    }
  }

  async set(k, v) {
   try {
     localStorage.setItem(k,JSON.stringify(v))
   } catch (e) {
     Error.sendOnce('local_store', 'set', 'error setting item', e)
   }
  }

  async clear() {
   try {
     localStorage.clear()
   } catch (e) {
     Error.sendOnce('local_store', 'clear', 'error clearing store', e)
   }
  }

  async del(k) {
    try {
      localStorage.removeItem(k)
    } catch (e) {
      Error.sendOnce('local_store', 'del', 'error removing item', e)
    }
  }
}
