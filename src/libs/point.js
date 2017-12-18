function Point(latLng) {
  this.latLng = latLng
}

Point.prototype.getLatLng = function () {
  return this.latLng
}

export default Point