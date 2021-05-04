import { getTimeFormatter } from 'src/libs/time';

function OsmSchedule(scheduleResponse) {
  if (!scheduleResponse) {
    return null;
  }
  this.isTwentyFourSeven = scheduleResponse.is_24_7;
  this.days = scheduleResponse.days;
  this.displayHours = translateSchedule(this.days);
  this.nextTransition = nextTransitionTime(
    scheduleResponse.seconds_before_next_transition,
    scheduleResponse.next_transition_datetime
  );
  this.status = scheduleResponse.status;
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
    return getTimeFormatter({ hour: '2-digit', minute: '2-digit' }).format(nextTransition);
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
      const timeFormatter = getTimeFormatter({ hour: '2-digit', minute: '2-digit' });
      return {
        beginning: timeFormatter.format(beginningHour),
        end: timeFormatter.format(endHour),
      };
    });
  }
  return [];
}

function translateSchedule(days) {
  const dayNameFormatter = getTimeFormatter({ weekday: 'long' });
  const getDayName = dow => {
    /* 2018-01-01 is a Monday */
    return dayNameFormatter.format(new Date(2018, 0, dow));
  };
  if (days) {
    return days.map(day => {
      return {
        dayName: getDayName(day.dayofweek),
        opening: toLocaleOpeningHours(day.opening_hours),
      };
    });
  }
  return [];
}

export default OsmSchedule;
