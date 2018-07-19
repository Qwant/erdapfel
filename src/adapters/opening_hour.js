import I18n from '../libs/i18n'

const days = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];
function parse(rawOpening) {
  var result = null;
  if (rawOpening === '' || rawOpening === null) {
    result = null;
  }
  else if (rawOpening == '24/7') {
    result = {'24/7': true};
  }
  else if (rawOpening == 'seasonal') {
    result = {'seasonal': true};
  }
  else {
    result = {};
    var modified_some_days = false;
    for (var k = 0; k < days.length; k++) {
      result[days[k]] = null;
    }

    var dayregex = /^(mo|tu|we|th|fr|sa|su)\-?(mo|tu|we|th|fr|sa|su)?$/,
      timeregex = /^\s*(\d\d:\d\d)\-(\d\d:\d\d)\s*$/,
      dayranges = rawOpening.toLowerCase().split(/\s*;\s*/),
      dayrange;
    while((dayrange = dayranges.shift())) {
      var daytimes = dayrange.trim().split(/\s+/),
        daytime,
        startday = 0,
        endday = 6,
        whichDays,
        whichTimes,
        starttime,
        endtime;

      while((daytime = daytimes.shift())) {
        if (dayregex.test(daytime)) {
          var daymatches = daytime.match(dayregex);

          if (daymatches.length === 3) {
            startday = days.indexOf(daymatches[1]);
            if (daymatches[2]) {
              endday = days.indexOf(daymatches[2]);
            } else {
              endday = startday;
            }
          } else {
            return null;
          }
        } else if (timeregex.test(daytime)) {
          var timematches = daytime.match(timeregex);

          if (timematches.length === 3) {
            starttime = timematches[1];
            endtime = timematches[2];
          } else {
            return null;
          }
        } else {
          return null;
        }
      }

      for (var j = startday; j <= endday; j++) {
        result[days[j]] = [starttime, endtime];
        modified_some_days = true;
      }

      if (!modified_some_days) {
        result = null;
      }
    }
  }
  return result;
}


function openingStatus(openingData) {

  if (openingData && openingData['24/7']) {
    return 999
    /* be sure it won't close soon */
  }
  let remoteDate = new Date()

  if (!openingData) return -1
  let dn = remoteDate.getDay()

  let schedules = openingData[I18n.days[dn]]
  if (!schedules) return -1
  let open = schedules[0]
  let close = schedules[1]

  let currentTime = remoteDate.getHours() * 60 + remoteDate.getMinutes() //convert time to minutes

  let [hours, minutes] = open.split(':') // time format is hh:mm
  let openingTime = parseInt(hours) * 60 + parseInt(minutes);

  [hours, minutes] = close.split(':')
  let closingTime = parseInt(hours) * 60 + parseInt(minutes)
  if (openingTime < closingTime) { // 10h00 14h30
    if (currentTime > openingTime && currentTime < closingTime) {
      return closingTime - currentTime
    }
  } else { // 17h00 2h00
    if (currentTime < openingTime || currentTime > closingTime) {
      return currentTime - closingTime
    }
  }
  return -1 // closed
}

export {parse, openingStatus}
