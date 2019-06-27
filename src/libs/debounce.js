export default function debounce(func, wait, scope) {
  let timeout;
  return function() {
    const context = scope || this, args = arguments;
    const later = function() {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
