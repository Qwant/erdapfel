function FileLoader(uri) {
  const x = new XMLHttpRequest()
  x.open('GET', uri);

  x.onprogress = function (event)  {
    if(this.onProgress) {
      this.onProgress(event)
    }
  }

  var it = this
  x.onreadystatechange = function () {
    if (x.readyState === 4) {
      if(x.status === 200) {
        if(it.onLoad) {
          it.onLoad()
        }
        eval(x.response)
      }
    }
  }
  x.send(null);
}
