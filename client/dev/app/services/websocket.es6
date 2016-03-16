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
      createP: websocketCreateP,
      send: websocketSend,
      close: websocketClose
    };
    R.curryService(websocketService);
    return websocketService;

    function websocketCreateP(url, name, handlers) {
      return new self.Promise((resolve, reject) => {
        name = R.defaultTo(url, name);
        handlers = R.thread(handlers)(
          R.over(R.lensProp('error'), R.defaultTo(defaultErrorHandler)),
          R.over(R.lensProp('close'), R.defaultTo(defaultCloseHandler))
        );

        const scheme = 'ws://';
        const uri = scheme + self.document.location.host + url;
        const socket = new self.WebSocket(uri);
        let resolved = false;
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
          R.threadP(event.data)(
            jsonParserService.parseP,
            (msg) => {
              if(R.isNil(handlers[msg.type])) {
                handlers.error('Unknown msg type', msg);
                return;
              }
              handlers[msg.type](msg);
            }
          );
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
      return R.thread(event)(
        jsonStringifierService.stringify,
        (msg) => socket.send(msg),
        R.always(socket)
      );
    }
    function websocketClose(socket) {
      socket.close();
      return socket;
    }
  }
})();
