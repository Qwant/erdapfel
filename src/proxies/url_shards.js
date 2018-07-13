function UrlShards() {}

if(!window.__url_state) {
  window.__url_state = {shards : []}
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

  return `${window.baseUrl}${url.join('/')}#${urlHash.join('&')}`
}

UrlShards.parseUrl = function () {
  let shards = []

  if(window.location.pathname) {
    let resourceRawShards = window.location.pathname.split('/')
    resourceRawShards = resourceRawShards.filter((resourceRawShard) => {
      return resourceRawShard !== ''
    })

    this.getShards().forEach((shard) => {
      let skip = false
      resourceRawShards.forEach((resourceRawShard, i) => {
        if(skip) {
          skip = false
          return
        }
        if(shard.prefix === resourceRawShard && resourceRawShards.length > i+1) {
          shards.push({prefix : resourceRawShard, value : resourceRawShards[i+1]})
          skip = true
        }
      })
    })
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
