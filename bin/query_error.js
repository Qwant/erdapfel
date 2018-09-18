/* simple error wrapper for future exception logging */

module.exports = class QueryError {
  constructor(error) {
    console.error(error)
  }
}