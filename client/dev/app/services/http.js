'use strict';

(function () {
  angular.module('clickApp.services').factory('http', httpServiceFactory);

  httpServiceFactory.$inject = [];
  function httpServiceFactory() {
    var httpService = {
      getP: httpGetP,
      postP: httpPostP,
      putP: httpPutP,
      deleteP: httpDeleteP
    };
    R.curryService(httpService);
    return httpService;

    function httpGetP(url) {
      return ajaxRequestP('GET', url);
    }
    function httpPostP(url, data) {
      return ajaxRequestP('POST', url, data);
    }
    function httpPutP(url, data) {
      return ajaxRequestP('PUT', url, data);
    }
    function httpDeleteP(url) {
      return ajaxRequestP('DELETE', url);
    }
    function ajaxRequestP(method, url, data) {
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
