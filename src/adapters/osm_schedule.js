const strftime = require('strftime')
const days = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];


function OsmSchedule(scheduleResponse, messages) {
  this.schedule = parse(scheduleResponse.raw)
  this.displayHours = translateSchedule(this.schedule)
  this.nextTransition = nextTransitionTime(scheduleResponse.seconds_before_next_transition, scheduleResponse.next_transition_datetime)
  this.status = scheduleStatus(this.schedule, messages)
}

/* private */

function parse(rawSchedule) {
  var result = null;
  if (rawSchedule === '' || rawSchedule === null) {
    result = null;
  }
  else if (rawSchedule === '24/7') {
    result = {isTwentyForSeven: true};
  }
  else if (rawSchedule === 'seasonal') {
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
      dayranges = rawSchedule.toLowerCase().split(/\s*;\s*/),
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


function scheduleStatus(schedule, timeMessages) {
  if(!schedule) {
    return {msg : '', color : '#fff'}
  }
  let remaining = schedule.seconds_before_next_transition
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

function translateSchedule(schedule) {
  if(schedule) {
    return Object.keys(schedule).map((scheduleKey) => {
      return {dayName : getDay(scheduleKey), opening : schedule[scheduleKey]}
    })
  } else {
    return []
  }
}

export default OsmSchedule
