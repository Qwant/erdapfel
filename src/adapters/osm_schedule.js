import strftime from 'strftime';

function OsmSchedule(scheduleResponse, messages) {
  this.isTwentyFourSeven = scheduleResponse.is_24_7;
  this.days = scheduleResponse.days;
  this.displayHours = translateSchedule(this.days);
  this.nextTransition = nextTransitionTime(
    scheduleResponse.seconds_before_next_transition,
    scheduleResponse.next_transition_datetime,
  );
  this.status = scheduleStatus(scheduleResponse, messages);
}


function scheduleStatus(scheduleResponse, timeMessages) {
  if (!scheduleResponse) {
    return {msg: '', color: '#fff'};
  }
  if (scheduleResponse.status === 'closed') {
    return {msg: timeMessages.closed.msg, color: timeMessages.closed.color};
  } else if (scheduleResponse.status === 'open') {
    return {msg: timeMessages.open.msg, color: timeMessages.open.color};
  }

  return {msg: '', color: '#fff'};
}

/**
 * Format next transition time
 * @param seconds The nb of seconds before next transition
 * @param nextTransitionDate Datetime of next transition
 * Both params may be null (eg for 24/7 places)
 */
function nextTransitionTime(seconds, nextTransitionDate) {
  if (nextTransitionDate && seconds < 12 * 60 * 60) {
    /*
       extract local time from nextTransitionDate
       "2019-05-12T18:00:00+02:00" => "18:00:00"
    */
    const nextTransition = hourToDate(nextTransitionDate.slice(11, 19));
    return strftime(window.i18nDate.timeFormat, nextTransition);
  }
  return false;
}

function hourToDate(hour) {
  return new Date(`${new Date().toDateString()} ${hour}`);
}

function toLocaleOpeningHours(hours) {
  if (hours) {
    return hours.map(hour => {
      const beginningHour = hourToDate(hour.beginning);
      const endHour = hourToDate(hour.end);
      return {
        beginning: strftime(window.i18nDate.timeFormat, beginningHour),
        end: strftime(window.i18nDate.timeFormat, endHour),
      };
    });
  }
  return [];
}

function translateSchedule(days) {
  if (days) {
    return days.map(day => {
      return {
        dayName: window.getDay(day.dayofweek % 7),
        opening: toLocaleOpeningHours(day.opening_hours),
      };
    });
  }
  return [];
}

export default OsmSchedule;
