/* eslint-disable-next-line */
function FileLoader(uri) {
  const sc = document.createElement('script');
  sc.src = uri;
  document.body.appendChild(sc);
  var it = this;
  sc.onload = function() {
    if (it.onLoad) {
      it.onLoad();
    }
  };
}
