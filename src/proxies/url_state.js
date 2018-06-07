function UrlState() {}

UrlState.init = function () {
  new UrlShards()
}

UrlState.registerHash = function(component, prefix) {
  register(component, prefix, true)
}

UrlState.registerResource = function(component, prefix) {
  register(component, prefix, false)
}

UrlState.updateUrl = function() {
  let url = UrlShards.toUrl()
  if(history && typeof history.replaceState !== 'undefined') {
    history.replaceState(null, null, url)
  } else {
    location.hash = url
  }
}

UrlState.load = function() {
  let rawShards = UrlShards.parseUrl()
  UrlShards.getShards().forEach((shard) => {
    let matchingRawShard = rawShards.find((rawShard) => {
      return rawShard.prefix === shard.prefix
    })
    if(matchingRawShard) {
      console.log(matchingRawShard.value)
      shard.restore(matchingRawShard.value)
    }
  })
}


/* private */

function register(component, prefix, isHash) {
  if(!component.store || !component.restore) {
    throw 'this componentn doesn\'t implement required methods'
  }
  UrlShards.add(new UrlShard(component, prefix, isHash))
}

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

  return `${url.join('/')}#${urlHash.join('&')}`
}

function UrlShard(component, prefix, isHash) {
  this.component = component
  this.isHash = isHash
  this.prefix = prefix
  this.consumable = true
}

UrlShards.parseUrl = function () {
  let shards = []
  if(window.location.pathname) {
    let resourceRawShards = window.location.pathname.split('/')
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

UrlShard.prototype.toString = function () {
  let value = this.component.store()
  if(value) {
    if(this.isHash) {
      return `${this.prefix}=${value}`
    } else {
      return `${this.prefix}/${value}`
    }
  } else {
    return null
  }
}

UrlShard.prototype.restore = function(value) {
  if(this.consumable) {
    this.consumable = false
    this.component.restore(value)
  }
}

export default UrlState
