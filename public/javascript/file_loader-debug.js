function FileLoader(uri) {
  let sc = document.createElement('script')
  sc.src = uri
  document.body.appendChild(sc)
  sc.onload = () => {
    if(this.onLoad) {
      this.onLoad()
    }
  }
}
