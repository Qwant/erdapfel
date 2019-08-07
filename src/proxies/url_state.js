import UrlShard, { paramTypes } from './url_shard';
import UrlShards from './url_shards';

function UrlState() {}

UrlState.init = function() {
  new UrlShards();
};

UrlState.registerHash = function(component, prefix) {
  UrlState.registerUrlShard(component, prefix, paramTypes.HASH);
};

UrlState.registerGet = function(component, prefix) {
  UrlState.registerUrlShard(component, prefix, paramTypes.GET);
};

UrlState.registerResource = function(component, prefix) {
  UrlState.registerUrlShard(component, prefix, paramTypes.RESOURCE);
};

UrlState.registerUrlShard = function(component, prefix, paramType) {
  if (!component.store || !component.restore) {
    throw 'this component doesn\'t implement required methods';
  }
  UrlShards.add(new UrlShard(component, prefix, paramType));
};


UrlState.pushUrl = function() {
  const url = UrlShards.toUrl();
  if (history && typeof history.pushState !== 'undefined') {
    history.pushState(null, null, url);
  } else {
    location.hash = url;
  }
};

UrlState.replaceUrl = function() {
  const url = UrlShards.toUrl();
  if (history && typeof history.replaceState !== 'undefined') {
    history.replaceState(null, null, url);
  } else {
    location.hash = url;
  }
};

UrlState.load = function() {
  const rawShards = UrlShards.parseUrl();
  UrlShards.getShards().forEach(shard => {
    const matchingRawShard = rawShards.find(rawShard => {
      return rawShard.prefix === shard.prefix;
    });
    if (matchingRawShard) {
      shard.restore(matchingRawShard.value);
    }
  });
};

UrlState.getShardValue = function(shardPrefix) {
  const shard = UrlShards.parseUrl().find(shard => shard.prefix === shardPrefix);
  return shard && shard.value;
};

UrlState.getShardCount = function() {
  return UrlShards.parseUrl().length;
};

export default UrlState;
