function FileLoader(uri) {

  let sc = document.createElement('script')
  sc.src = uri
  document.body.appendChild(sc)
  sc.onload = () => {
    if(this.onLoad) {
      this.onLoad()
    }
  }
  return



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
