'use strict';

(function () {
  angular.module('clickApp.services').factory('websocket', websocketServiceFactory);

  websocketServiceFactory.$inject = ['appAction', 'appError', 'jsonParser', 'jsonStringifier'];
  function websocketServiceFactory(appActionService, appErrorService, jsonParserService, jsonStringifierService) {
    var websocketService = {
      createP: websocketCreateP,
      send: websocketSend,
      close: websocketClose
    };
    R.curryService(websocketService);
    return websocketService;

    function websocketCreateP(url, name, actions) {
      return new self.Promise(function (resolve, reject) {
        name = R.defaultTo(url, name);
        actions = R.thread(actions)(R.over(R.lensProp('error'), R.defaultTo('Websocket.error')), R.over(R.lensProp('close'), R.defaultTo('Websocket.close')));

        var scheme = 'ws://';
        var uri = scheme + self.document.location.host + url;
        var socket = new self.WebSocket(uri);
        var resolved = false;
        socket.onopen = websocketOnOpen;
        socket.onerror = websocketOnError;
        socket.onclose = websocketOnClose;
        socket.onmessage = websocketOnMessage;

        function websocketOnOpen(event) {
          console.warn('WebSocket open', name, event);
          resolve(socket);
          resolved = true;
        }
        function websocketOnError(event) {
          appActionService.do(actions.error, event);
        }
        function websocketOnClose() /* event */{
          if (!resolved) {
            reject('Connection error');
            resolved = true;
            return;
          }
          appActionService.do(actions.close);
        }
        function websocketOnMessage(event) {
          // console.log('WebSocket message', name, event);
          R.threadP(event.data)(jsonParserService.parseP, R.ifElse(function (msg) {
            return R.exists(actions[msg.type]);
          }, function (msg) {
            appActionService.do(actions[msg.type], msg);
          }, function (msg) {
            appErrorService.emit('Websocket: unknown msg type ' + msg.type, msg);
          }));
        }
      });
    }
    function websocketSend(event, socket) {
      return R.thread(event)(jsonStringifierService.stringify, function (msg) {
        return socket.send(msg);
      }, R.always(socket));
    }
    function websocketClose(socket) {
      socket.close();
      return socket;
    }
  }
})();
//# sourceMappingURL=websocket.js.map
