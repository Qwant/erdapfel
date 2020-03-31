
function OsmSchedule(scheduleResponse) {
  if (!scheduleResponse) {
    return null;
  }
  this.isTwentyFourSeven = scheduleResponse.is_24_7;
  this.days = scheduleResponse.days;
  this.displayHours = translateSchedule(this.days);
  this.nextTransition = nextTransitionTime(
    scheduleResponse.seconds_before_next_transition,
    scheduleResponse.next_transition_datetime,
  );
  this.status = scheduleResponse.status;
}

function getIntlLocales() {
  const lang = window.getLang();
  const locales = [lang.locale].concat(lang.fallback || []);
  // Intl expects '-' in locales, such as "en-GB"
  return locales.map(l => l.replace(/_/g, '-'));
}

function getTimeFormatter() {
  return Intl.DateTimeFormat(getIntlLocales(), { hour: '2-digit', minute: '2-digit' });
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
    return getTimeFormatter().format(nextTransition);
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
      const timeFormatter = getTimeFormatter();
      return {
        beginning: timeFormatter.format(beginningHour),
        end: timeFormatter.format(endHour),
      };
    });
  }
  return [];
}


function translateSchedule(days) {
  const dayNameFormatter = Intl.DateTimeFormat(getIntlLocales(), { weekday: 'long' });
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
