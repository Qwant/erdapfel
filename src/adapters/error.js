import Ajax from '../libs/ajax';
import nconf from '../../local_modules/nconf_getter';

const errorEventUrl = 'logs';
const system = nconf.get().system;
const errorUrl = `${system.baseUrl}${errorEventUrl}`;

if (!window.__registredErrors) {
  window.__registredErrors = [];
}

export default class Error {
  constructor(file, method, message, exception) {
    this.file = file;
    this.method = method;
    this.message = message;
    this.exception = exception;
  }

  equal(e) {
    return e.file === this.file && e.method === this.method && e.message === this.message &&
      e.exception.toString() === this.exception.toString();
  }

  log() {
    Ajax.post(errorUrl, this.serialise());
  }

  serialise() {
    return {...this, exception: this.exception.toString()};
  }

  static sendOnce(file, method, message, exception) {
    let error = new Error(file, method, message, exception);
    let existingError = window.__registredErrors.find((error) => {
      return error.equal(error);
    });
    if (!existingError) {
      window.__registredErrors.push(error);
      error.log();
    }
    console.error(error);
  }

  static send(file, method, message, exception) {
    let error = new Error(file, method, message, exception);
    error.log();
    console.error(error);
  }
}
