(function() {
  angular.module('clickApp.services')
    .factory('websocket', websocketServiceFactory);

  websocketServiceFactory.$inject = [
    'jsonParser',
    'jsonStringifier',
  ];
  function websocketServiceFactory(jsonParserService,
                                   jsonStringifierService) {
    const websocketService = {
      create: websocketCreate,
      send: websocketSend,
      close: websocketClose
    };
    R.curryService(websocketService);
    return websocketService;

    function websocketCreate(url, name, handlers) {
      return new self.Promise((resolve, reject) => {
        name = R.defaultTo(url, name);
        handlers = R.pipe(
          R.over(R.lensProp('error'), R.defaultTo(defaultErrorHandler)),
          R.over(R.lensProp('close'), R.defaultTo(defaultCloseHandler))
        )(handlers);

        var scheme = 'ws://';
        var uri = scheme + self.document.location.host + url;
        var socket = new self.WebSocket(uri);
        var resolved = false;
        socket.onopen = websocketOnOpen;
        socket.onerror = websocketOnError;
        socket.onclose = websocketOnClose;
        socket.onmessage = websocketOnMessage;

        function websocketOnOpen(event) {
          console.error('WebSocket open', name, event);
          resolve(socket);
          resolved = true;
        }
        function websocketOnError(event) {
          handlers.error('socketError', event);
        }
        function websocketOnClose(/* event */) {
          if(!resolved) {
            reject('Connection error');
            resolved = true;
            return;
          }
          handlers.close();
        }
        function websocketOnMessage(event) {
          console.log('WebSocket message', name, event);
          R.pipeP(
            jsonParserService.parse,
            (msg) => {
              if(R.isNil(handlers[msg.type])) {
                handlers.error('Unknown msg type', msg);
                return;
              }
              handlers[msg.type](msg);
            }
          )(event.data);
        }
        function defaultErrorHandler(reason, event) {
          console.error('WebSocket error', name, reason, event);
        }
        function defaultCloseHandler() {
          console.error('WebSocket close', name);
        }
      });
    }
    function websocketSend(event, socket) {
      return R.pipeP(
        jsonStringifierService.stringify,
        socket.send
      )(event);
    }
    function websocketClose(socket) {
      return new self.Promise((resolve) => {
        socket.close();
        resolve();
      });
    }
  }
})();
