export default function debounce (func, wait, scope) {
  var timeout;
  return function() {
    var context = scope || this, args = arguments;
    var later = function() {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}