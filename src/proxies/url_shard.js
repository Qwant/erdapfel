function UrlShard(component, prefix, isHash) {
  this.component = component
  this.isHash = isHash
  this.prefix = prefix
  this.consumable = true
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

export default UrlShard
