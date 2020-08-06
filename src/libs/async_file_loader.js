
function AsyncFileLoader(uri) {
  return new Promise(resolve => {
    const sc = document.createElement('script');
    sc.onload = resolve;
    sc.src = uri;
    document.body.appendChild(sc);
  });
}

export default AsyncFileLoader;
