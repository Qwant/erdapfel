if(!window._errors) {
  window._errors = {}
}

export default class Error {
  constructor(file, method, message, exception) {
    this.file = file
    this.method = method
    this.message = message
    this.exception = exception
  }

  static displayOnce() {

  }

  static display() {

  }
}