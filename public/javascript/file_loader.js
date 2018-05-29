function FileLoader(uri) {
  const x = new XMLHttpRequest()
  x.open('GET', uri);

  x.onprogress = (event) => {
    if(this.onProgress) {
      this.onProgress(event)
    }
  }

  x.onreadystatechange = () => {
    if (x.readyState === 4) {
      if(x.status === 200) {
        if(this.onLoad) {
          this.onLoad()
        }
        eval(x.response)
      }
    }
  }
  x.send(null);
}
