import sys
import json
import gzip
import yaml

ISO_CODE_TAGS = ['ISO3166-1', 'ISO3166-2']

def extract_zones_by_iso_code():
    zones = {}
    for line in gzip.open(sys.stdin.buffer):
        zone = json.loads(line)
        iso_codes = []
        for tag in ISO_CODE_TAGS:
            value = zone["tags"].get(tag)
            if value:
                iso_codes.append(value)
        if not iso_codes:
            continue
        filtered_zone = {k:zone[k] for k in ["osm_id","bbox","wikidata"]}
        filtered_zone["name"] = zone["tags"].get("name:en") or zone["name"]
        filtered_zone["label"] = zone["international_labels"].get("en") or zone["label"]
        filtered_zone["center"] = zone["center"]["coordinates"]
        for code in iso_codes:
            zones[code] = filtered_zone
    return zones


if __name__ == '__main__':
    # Usage: python3 build_iso_code_regions_map.py < cosmogony.jsonl.gz > regions.yaml
    #
    # Cosmogony file source:
    # https://github.com/osm-without-borders/cosmogony/releases/download/v0.7.3/cosmogony-2020-03-16.jsonl.gz
    zones = extract_zones_by_iso_code()
    print(yaml.dump(zones))
