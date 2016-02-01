'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

angular.module('clickApp.services').factory('state', ['pubSub', 'fileImport', 'stateExports', 'stateData', 'stateUser', 'stateGame', 'stateGames', 'stateModes', function stateServiceFactory(pubSubService, fileImportService, stateExportsService, stateDataService, stateUserService, stateGameService, stateGamesService, stateModesService) {
  var stateService = {
    init: function stateInit() {
      var state = pubSubService.init({}, 'State');
      state.processing = false;
      state.change_queue = [];

      state.event = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return stateService.event.apply(null, [].concat(args, [state]));
      };
      state.onEvent = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return pubSubService.subscribe.apply(null, [].concat(args, [state]));
      };

      state.change = pubSubService.init({}, 'State.Change');
      state.changeEvent = function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        if (state.processing) {
          console.info('State <--- ChangeEvent', args[0], R.tail(args));
          state.change_queue = R.append(args, state.change_queue);
          return self.Promise.resolve();
        }
        console.info('State <=== ChangeEvent', args[0], R.tail(args));
        return pubSubService.publish.apply(null, [].concat(args, [state.change]));
      };
      state.changeEventUnbuffered = function () {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        console.info('State <---[U] ChangeEvent', args[0], R.tail(args));
        return pubSubService.publish.apply(null, [].concat(args, [state.change]));
      };

      state = stateDataService.init(state);
      state = stateUserService.init(state);
      state = stateGameService.init(state);
      state = stateGamesService.init(state);
      state = stateModesService.init(state);

      exportCurrentDumpFile(state);
      return state;
    },
    event: function stateEvent() {
      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      var state = R.last(args);
      var processing = state.processing;
      state.processing = true;
      console.info('State ---> Event', args[0], R.init(R.tail(args)));
      // console.trace();
      return R.pipeP(function () {
        return pubSubService.publish.apply(null, args);
      }, function () {
        if (processing) return self.Promise.reject();else return null;
      }, function () {
        return stateDataService.save(state);
      }, function () {
        return stateUserService.save(state);
      }, function () {
        return stateGameService.save(state);
      }, function () {
        return stateGamesService.save(state);
      }, function () {
        return stateModesService.save(state);
      }, function () {
        return exportCurrentDumpFile(state);
      }, function () {
        state.processing = processing;
      }, function () {
        // console.log(state.change_queue);
        state.change_queue = R.uniq(state.change_queue);
        return function dispatchChange(queue) {
          if (R.isEmpty(queue)) return null;
          var args = R.head(queue);
          console.log('State: change queue <===', R.head(args));
          return pubSubService.publish.apply(null, [].concat(_toConsumableArray(args), [state.change])).then(function () {
            return dispatchChange(R.tail(queue));
          });
        }(state.change_queue);
      }, function () {
        state.change_queue = [];
      })().catch(R.always(null)).then(function () {
        state.processing = processing;
      });
    },
    onChangeEvent: function stateOnChangeEvent(event, listener, state) {
      return pubSubService.subscribe(event, listener, state.change);
    },
    onLoadDumpFile: function stateOnLoadDumpFile(state, event, file) {
      return R.pipeP(fileImportService.read$('json'), function (data) {
        return R.pipeP(function () {
          return stateDataService.onSettingsReset(state, event, data.settings);
        }, function () {
          return stateGamesService.loadNewLocalGame(state, data.game);
        }, function () {
          state.changeEvent('State.loadDumpFile', 'File loaded');
        })();
      })(file).catch(function (error) {
        state.changeEvent('State.loadDumpFile', error);
      });
    }
  };
  var exportCurrentDumpFile = stateExportsService.export$('dump', function (state) {
    return { settings: R.pathOr({}, ['settings', 'current'], state),
      game: R.propOr({}, 'game', state)
    };
  });
  R.curryService(stateService);
  return stateService;
}]);
//# sourceMappingURL=state.js.map
