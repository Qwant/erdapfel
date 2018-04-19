module.exports = {
  i18nData: {
    message: {'fr test': 'en test'},
    getPlural: function (n) {
      return n > 1
    }
  },
  date: {
    dayNames: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ]
  }
}