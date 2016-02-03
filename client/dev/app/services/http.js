'use strict';

(function () {
  angular.module('clickApp.services').factory('http', httpServiceFactory);

  httpServiceFactory.$inject = [];
  function httpServiceFactory() {
    var httpService = {
      get: httpGet,
      post: httpPost,
      put: httpPut,
      delete: httpDelete
    };
    R.curryService(httpService);
    return httpService;

    function httpGet(url) {
      return ajaxRequest('GET', url);
    }
    function httpPost(url, data) {
      return ajaxRequest('POST', url, data);
    }
    function httpPut(url, data) {
      return ajaxRequest('PUT', url, data);
    }
    function httpDelete(url) {
      return ajaxRequest('DELETE', url);
    }
    function ajaxRequest(method, url, data) {
      return new self.Promise(function (resolve, reject) {
        var client = new self.XMLHttpRequest();
        client.open(method, url);
        client.responseType = 'json';
        if (R.exists(data)) {
          client.send(JSON.stringify(data));
        } else {
          client.send();
        }
        client.onload = function () {
          if (client.status >= 200 && client.status < 300) {
            resolve(client.response);
          } else {
            reject(client.statusText);
          }
        };
        client.onerror = function () {
          reject(client.statusText);
        };
      });
    }
  }
})();
//# sourceMappingURL=http.js.map
