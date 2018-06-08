function UrlShards() {
  if(!window.__url_state) {
    window.__url_state = {shards : []}
  }
}

UrlShards.add = function (shard) {
  UrlShards.getShards().push(shard)
}

UrlShards.getShards = function () {
  return window.__url_state.shards
}

UrlShards.toUrl = function () {
  let url = UrlShards.getShards()
    .filter((shard) => !shard.isHash)
    .map((shard) => shard.toString())
    .filter((shard) => shard !== null)

  let urlHash = UrlShards.getShards()
    .filter((shard) => shard.isHash)
    .map((shard) => shard.toString())
    .filter((shard) => shard !== null)

  return `/${url.join('/')}#${urlHash.join('&')}`
}



UrlShards.parseUrl = function () {
  let shards = []
  if(window.location.pathname) {
    let resourceRawShards = window.location.pathname.split('/')
    resourceRawShards = resourceRawShards.filter((resourceRawShard) => {
      return resourceRawShard !== ''
    })
    for(let i = 0; i < resourceRawShards.length; i += 2) {
      shards.push({prefix : resourceRawShards[i], value : resourceRawShards[i+1]})
    }
  }

  if(window.location.hash) {
    let rawHash = window.location.hash
    if(rawHash.indexOf('#') === 0) {
      rawHash = rawHash.replace(/^#/, '')
    }
    let hashRawShards = rawHash.split('&')
    for(let i = 0; i < hashRawShards.length; i += 1) {
      let hashShardsKV = hashRawShards[i].split('=')
      shards.push({prefix : hashShardsKV[0], value : hashShardsKV[1]})
    }
  }
  return shards
}

export default UrlShards
