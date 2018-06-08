import UrlShard from './url_shard'
import UrlShards from './url_shards'

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

UrlState.pushUrl = function() {
  let url = UrlShards.toUrl()
  if(history && typeof history.pushState !== 'undefined') {
    history.pushState(null, null, url)
  } else {
    location.hash = url
  }
}

UrlState.replaceUrl = function() {
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

export default UrlState
