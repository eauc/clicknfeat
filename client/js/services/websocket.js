'use strict';

angular.module('clickApp.services')
  .factory('websocket', [
    '$document',
    'jsonParser',
    'jsonStringifier',
    function websocketServiceFactory($document,
                                     jsonParserService,
                                     jsonStringifierService) {
      return {
        create: function websocketCreate(url, name, handlers) {
          return new self.Promise(function(resolve, reject) {
            name = R.defaultTo(url, name);
            handlers.error = R.defaultTo(defaultErrorHandler, handlers.error);
            handlers.close = R.defaultTo(defaultCloseHandler, handlers.close);

            var scheme = 'ws://';
            var uri = scheme + self.document.location.host + url;
            var socket = new self.WebSocket(uri);
            var resolved = false;
            socket.onopen = function websocketOnOpen(event) {
              console.error('WebSocket open', name, event);
              resolve(socket);
              resolved = true;
            };
            socket.onerror = function websocketOnError(event) {
              handlers.error('socketError', event);
            };
            socket.onclose = function websocketOnClose(/* event */) {
              if(!resolved) {
                reject('Connection error');
                resolved = true;
                return;
              }
              handlers.close();
            };
            socket.onmessage = function websocketOnMessage(event) {
              console.log('WebSocket message', name, event);
              R.pipeP(
                jsonParserService.parse,
                function(msg) {
                  if(R.isNil(handlers[msg.type])) {
                    handlers.error('Unknown msg type', msg);
                    return;
                  }
                  handlers[msg.type](msg);
                }
              )(event.data);
            };
            function defaultErrorHandler(reason, event) {
              console.error('WebSocket error', name, reason, event);
            }
            function defaultCloseHandler() {
              console.error('WebSocket close', name);
            }
          });
        },
        send: function websocketSend(event, socket) {
          return R.pipeP(
            jsonStringifierService.stringify,
            function(data) {
              socket.send(data);
            }
          )(event);
        },
        close: function websocketClose(socket) {
          return new self.Promise(function(resolve/*, reject */) {
            socket.close();
            resolve();
          });
        },
      };
    }
  ]);
