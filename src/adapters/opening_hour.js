const strftime = require('strftime')
const days = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];


function HourlyEvent(rawOpening, messages) {
  this.hours = parse(rawOpening.raw)
  this.displayHours = translateHours(this.hours )
  this.nextTransition = nextTransitionTime(rawHourly.seconds_before_next_transition, rawHourly.next_transition_datetime)
  this.status = openingStatus(this.hours, messages)
}



/* private */

function parse(rawOpening) {
  var result = null;
  if (rawOpening === '' || rawOpening === null) {
    result = null;
  }
  else if (rawOpening === '24/7') {
    result = {isTwentyForSeven: true};
  }
  else if (rawOpening === 'seasonal') {
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


function openingStatus(hours, timeMessages) {
  if(!hours) {
    return {msg : '', color : '#fff'}
  }
  let remaining = hours.seconds_before_next_transition
  if(remaining === -1) {
    return {msg : timeMessages.closed.msg, color : timeMessages.closed.color}
  }
  for(let tmKey in timeMessages) {
    let tm = timeMessages[tmKey]
    if(tm.time && tm.time > remaining) {
      return {msg : tm.msg, color : timeMessages.open.color}
    }
  }
  return {msg : timeMessages.open.msg, color : timeMessages.open.color}
}

function nextTransitionTime(seconds, nextTransitionDate) {
  if(seconds < 12 * 60 * 60) {
    let nextTransition = new Date(nextTransitionDate)
    return strftime(i18nDate.timeFormat, nextTransition)
  }
  return false
}

function translateHours(hours) {
  if(hours) {
    return Object.keys(hours).map((hourKey) => {
      return {dayName : getDay(hourKey), opening : hours[hourKey]}
    })
  } else {
    return []
  }
}


export default HourlyEvent
