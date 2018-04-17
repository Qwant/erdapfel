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
};

let build_value = function(obj) {
  var result = "";
  if ('mo' in obj && obj.mo[0] && obj.mo[1]) {
    result += 'Mo ' + obj.mo[0] + '-' + obj.mo[1];
  }
  if ('tu' in obj && obj.tu[0] && obj.tu[1]) {
    if (result.length > 0) { result += '; '; }
    result += 'Tu ' + obj.tu[0] + '-' + obj.tu[1];
  }
  if ('we' in obj && obj.we[0] && obj.we[1]) {
    if (result.length > 0) { result += '; '; }
    result += 'We ' + obj.we[0] + '-' + obj.we[1];
  }
  if ('th' in obj && obj.th[0] && obj.th[1]) {
    if (result.length > 0) { result += '; '; }
    result += 'Th ' + obj.th[0] + '-' + obj.th[1];
  }
  if ('fr' in obj && obj.fr[0] && obj.fr[1]) {
    if (result.length > 0) { result += '; '; }
    result += 'Fr ' + obj.fr[0] + '-' + obj.fr[1];
  }
  if ('sa' in obj && obj.sa[0] && obj.sa[1]) {
    if (result.length > 0) { result += '; '; }
    result += 'Sa ' + obj.sa[0] + '-' + obj.sa[1];
  }
  if ('su' in obj && obj.su[0] && obj.su[1]) {
    if (result.length > 0) { result += '; '; }
    result += 'Su ' + obj.su[0] + '-' + obj.su[1];
  }
  return result;
}

export default parse
