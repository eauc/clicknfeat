'use strict';

angular.module('clickApp.services').factory('http', [function httpServiceFactory() {
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
  var httpService = {
    get: function httpGet(url) {
      return ajaxRequest('GET', url);
    },
    post: function httpGet(url, data) {
      return ajaxRequest('POST', url, data);
    },
    put: function httpGet(url, data) {
      return ajaxRequest('PUT', url, data);
    },
    delete: function httpGet(url) {
      return ajaxRequest('DELETE', url);
    }
  };
  R.curryService(httpService);
  return httpService;
}]);
//# sourceMappingURL=http.js.map
