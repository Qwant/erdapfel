/**
 * simple Poi helper
 */
import type { LngLat } from 'mapbox-gl';

export const POI_TYPE = 'poi';

export type TPoi = {
  id?: string;
  name?: string;
  type?: string;
  latLon?: LngLat;
  className?: string;
  subClassName?: string;
  bbox?: [number, number, number, number];
};

export default class Poi {
  id: TPoi['id'];
  name: TPoi['name'];
  type: TPoi['type'];
  latLon: TPoi['latLon'];
  className: TPoi['className'];
  subClassName: TPoi['subClassName'];
  bbox: TPoi['bbox'];

  constructor(
    id: TPoi['id'],
    name: TPoi['name'],
    type: TPoi['type'],
    latLon: TPoi['latLon'],
    className: TPoi['className'],
    subClassName: TPoi['subClassName'],
    bbox?: TPoi['bbox']
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.latLon = latLon;
    this.className = className;
    this.subClassName = subClassName;
    this.bbox = bbox;
  }

  static deserialize(raw: TPoi) {
    const { id, name, type, latLon, className, subClassName, bbox } = raw;
    return new Poi(id, name, type, latLon, className, subClassName, bbox);
  }
}
