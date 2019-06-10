export const paramTypes = {
  HASH: 'hash',
  GET: 'get',
  RESOURCE: 'resource'
};

function UrlShard(component, prefix, paramType) {
  this.component = component;
  this.paramType = paramType;
  this.prefix = prefix;
  this.consumable = true;
}

UrlShard.prototype.toString = function() {
  let value = this.component.store();
  if (value) {
    if (this.paramType === paramTypes.HASH) {
      return `${this.prefix}=${value}`;
    } else if (this.paramType === paramTypes.RESOURCE) {
      return `${this.prefix}/${value === true ? '' : value}`;
    } else if (this.paramType === paramTypes.GET) {
      return `${this.prefix}=${value}`;
    }
  } else {
    return null;
  }
};

UrlShard.prototype.restore = function(value) {
  if (this.consumable) {
    this.consumable = false;
    this.component.restore(value);
  }
};

export default UrlShard;
