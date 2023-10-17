/**
 * simple Poi helper
 */
import type { LngLat } from 'maplibre-gl';

export const POI_TYPE = 'poi';

export type TPoi = {
  id?: string;
  qwant_id?: string;
  name?: string;
  type?: string;
  latLon?: LngLat;
  className?: string;
  subClassName?: string;
  bbox?: [number, number, number, number];
};

export default class Poi {
  id: TPoi['id'];
  qwant_id: TPoi['qwant_id'];
  name: TPoi['name'];
  type: TPoi['type'];
  latLon: TPoi['latLon'];
  className: TPoi['className'];
  subClassName: TPoi['subClassName'];
  bbox: TPoi['bbox'];

  constructor(
    id: TPoi['id'],
    qwant_id: TPoi['qwant_id'],
    name: TPoi['name'],
    type: TPoi['type'],
    latLon: TPoi['latLon'],
    className: TPoi['className'],
    subClassName: TPoi['subClassName'],
    bbox?: TPoi['bbox']
  ) {
    this.id = id;
    this.qwant_id = qwant_id;
    this.name = name;
    this.type = type;
    this.latLon = latLon;
    this.className = className;
    this.subClassName = subClassName;
    this.bbox = bbox;
  }

  static deserialize(raw: TPoi) {
    const { id, qwant_id, name, type, latLon, className, subClassName, bbox } = raw;
    return new Poi(id, qwant_id, name, type, latLon, className, subClassName, bbox);
  }
}
