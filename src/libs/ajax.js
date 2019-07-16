import nconf from '@qwant/nconf-getter';
import Error from './../adapters/error';

const systemConfigs = nconf.get().system;

function Ajax() {}

Ajax.get = (url, data, options) => {
  return query(url, data, 'GET', options);
};

Ajax.post = (url, data, options) => {
  return query(url, data, 'POST', options);
};

Ajax.getLang = async(url, data = {}, options) => {
  data.lang = window.getLang().code;
  return Ajax.get(url, data, options);
};

/* private */
const query = (url, data, method = 'GET', options = {}) => {
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
      xhr.send();
    } else {
      xhr.open(method, url);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
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
