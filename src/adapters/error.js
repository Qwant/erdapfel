import Ajax from "../libs/ajax";
import nconf from "../../local_modules/nconf_getter";

const errorEventUrl = 'logs'
const system = nconf.get().system
const errorUrl = `${system.baseUrl}${errorEventUrl}`

if(!window._errors) {
  window._errors = []
}

export default class Error {
  constructor(file, method, message, exception) {
    this.file = file
    this.method = method
    this.message = message
    this.exception = exception
  }

  equal(e) {
    return e.file === this.file && e.method === this.method && e.message === this.message && e.exception.toString() === this.exception.toString()
  }

  log() {
    Ajax.post(errorUrl, this)
  }

  static displayOnce(file, method, message, exception) {
    let error = new Error(file, method, message, exception)
    let existingError = _errors.find((error) => {
      return error.equal(error)
    })
    if(!existingError) {
      _errors.push(error)
      error.log()
    }
    console.error(error)
  }

  static display(file, method, message, exception) {
    let error = new Error(file, method, message, exception)
    error.log()
    console.error(error)
  }
}