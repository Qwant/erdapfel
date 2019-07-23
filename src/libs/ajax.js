import nconf from '@qwant/nconf-getter';
import Error from './../adapters/error';

const systemConfigs = nconf.get().system;

function Ajax() {}

Ajax.get = (url, data, options, headers = {}) => {
  return query(url, data, 'GET', options, headers);
};

Ajax.post = (url, data, options, headers = {}) => {
  return query(url, data, 'POST', options, headers);
};

Ajax.getLang = async (url, data = {}, options = {}, headers = {}) => {
  data.lang = window.getLang().code;
  return Ajax.get(url, data, options, headers);
};

function setHeaders(xhr, headers) {
  if (typeof headers !== 'object') {
    return;
  }
  for (const key in headers) {
    if (!headers.hasOwnProperty(key)) {
      continue;
    }
    xhr.setRequestHeader(key, headers[key]);
  }
}

function headersContain(headers, value) {
  return typeof header === 'object' && headers[value] !== undefined;
}

/* private */
const query = (url, data, method = 'GET', options = {}, headers = {}) => {
  const xhr = new XMLHttpRequest();
  const timeout = options.timeout * 1000 || systemConfigs.timeout * 1000;
  const ajaxPromise = new Promise((resolve, reject) => {
    let jsonResponse;
    let xhrStatus = -1;
    const timeOutHandler = setTimeout(() => {
      xhr.abort();
      reject(`Timeout calling ${url}`);
    }, timeout * 1000);

    xhr.onload = function() {
      if (xhrStatus !== 204) {
        try {
          jsonResponse = JSON.parse(this.response);
        } catch (e) {
          clearTimeout(timeOutHandler);
          const resp = this.response.substr(0, 100);
          Error.sendOnce('ajax', 'query',
            `response parse error. url ${url}. response ${resp}...`, e);
          reject(e);
          return;
        }
        resolve(jsonResponse);
      } else {
        resolve();
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && (xhr.status < 200 || xhr.status >= 300)) {
        clearTimeout(timeOutHandler);
        reject(xhr.status);
      } else {
        xhrStatus = xhr.status;
      }
    };
    if (method === 'GET') {
      xhr.open(method, `${url}?${dataToUrl(data)}`);
      setHeaders(xhr, headers);
      xhr.send();
    } else {
      xhr.open(method, url);
      setHeaders(xhr, headers);
      if (method === 'POST' && !headersContain(headers, 'Content-Type') &&
          data && data.length > 0) {
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      }
      xhr.send(JSON.stringify(data));
    }

  });
  ajaxPromise.abort = () => {
    xhr.abort();
  };

  return ajaxPromise;
};

const dataToUrl = data =>
  Object.keys(data)
    .map(itemKey => `${encodeURIComponent(itemKey)}=${encodeURIComponent(data[itemKey])}`)
    .join('&');

export default Ajax;
