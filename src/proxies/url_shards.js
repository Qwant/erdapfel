import {paramTypes} from './url_shard'

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
  let urlResources = UrlShards.getShards()
    .filter((shard) => shard.paramType === paramTypes.RESOURCE)
    .map((shard) => shard.toString())
    .filter((shard) => shard !== null)

  let urlHash = UrlShards.getShards()
    .filter((shard) => shard.paramType === paramTypes.HASH)
    .map((shard) => shard.toString())
    .filter((shard) => shard !== null)

  let urlGet = UrlShards.getShards()
    .filter((shard) => shard.paramType === paramTypes.GET)
    .map((shard) => shard.toString())
    .filter((shard) => shard !== null)

  let url = window.baseUrl
  if(urlResources.length > 0) {
    url += `${urlResources.join('/')}`
  }
  if(urlGet.length > 0) {
    url += `?${urlGet.join('&')}`
  }
  if(urlHash.length > 0) {
    url += `#${urlHash.join('&')}`
  }
  return url
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
        if(shard.prefix === resourceRawShard) {
          shards.push({prefix : resourceRawShard, value : resourceRawShards.length > i+1 ? resourceRawShards[i+1] : null})
          skip = true
        }
      })
    })
  }

  let getParams = new URLSearchParams(location.search)
  this.getShards().forEach((shard) => {
    let matchingShard = getParams.get(shard.prefix)
    if(matchingShard) {
      shards.push({prefix : shard.prefix, value : matchingShard})
    }
  })

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
