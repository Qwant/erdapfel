const fs = require('fs')
const path = require('path')

module.exports = function (req, res) {
  let tile = fs.readFileSync(path.join(__dirname, '182.pbf'))
  res.send(tile)
}