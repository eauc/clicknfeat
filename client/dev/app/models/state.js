'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.services').factory('state', stateServiceFactory);

  stateServiceFactory.$inject = ['pubSub',
  // 'fileImport',
  // 'stateExports',
  // 'stateData',
  'stateUser', 'stateGame', 'stateGames', 'stateModes'];
  function stateServiceFactory(pubSubService,
  // fileImportService,
  // stateExportsService,
  // stateDataService,
  stateUserService, stateGameService, stateGamesService, stateModesService) {
    var stateService = {
      create: stateCreate,
      queueEventP: stateQueueEventP,
      onChangeEvent: stateOnChangeEvent
    };
    // onLoadDumpFile: stateOnLoadDumpFile
    R.curryService(stateService);
    return stateService;

    function stateCreate() {
      var state = pubSubService.init({
        event_queue: [],
        onEvent: onEvent,
        change: pubSubService.init({}, 'State.Change'),
        change_event_queue: [],
        eventP: eventP,
        changeEventP: changeEventP,
        queueChangeEventP: queueChangeEventP
      }, 'State');

      state = R.thread(state)(
      // starting here State is mutable
      // stateDataService.create,
      stateUserService.create, stateGameService.create, stateGamesService.create, stateModesService.create);

      // exportCurrentDumpFile(state);
      return state;

      function onEvent() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return pubSubService.subscribe.apply(null, [].concat(args, [state]));
      }
      function queueChangeEventP() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return new self.Promise(function (resolve) {
          console.info('StateChange <---', args[0], R.tail(args));
          state.change_event_queue = R.append([resolve, args], state.change_event_queue);
        });
      }
      function eventP() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        return stateEventP(args, state);
      }
      function changeEventP() {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        return stateChangeEventP(args, state);
      }
    }
    function stateQueueEventP(args, state) {
      return new self.Promise(function (resolve) {
        console.info('State ---> Event', args[0], R.tail(args));
        state.event_queue = R.append([resolve, args], state.event_queue);
        startEventQueueProcessing(state);
      });
    }
    function startEventQueueProcessing(state) {
      if (state.processing_event_queue) return;
      state.processing_event_queue = true;
      self.Promise.resolve(processNextEventP(state)).then(function () {
        state.processing_event_queue = false;
      });
    }
    function processNextEventP(state) {
      if (R.isEmpty(state.event_queue)) {
        return self.Promise.resolve();
      }

      var _R$head = R.head(state.event_queue);

      var _R$head2 = _slicedToArray(_R$head, 2);

      var resolve = _R$head2[0];
      var args = _R$head2[1];

      return R.threadP(stateEventP(args, state))(
      // () => { return stateDataService.save(state); },
      function () {
        return stateUserService.save(state);
      },
      // () => { return stateGameService.save(state); },
      function () {
        return stateGamesService.save(state);
      }, function () {
        return stateModesService.save(state);
      },
      // () => { return exportCurrentDumpFile(state); },
      function () {
        return processNextChangeEventP(state);
      }).catch(R.spyAndDiscardError('processNextEvent')).then(function () {
        state.event_queue = R.tail(state.event_queue);
        resolve();
        return processNextEventP(state);
      });
    }
    function processNextChangeEventP(state) {
      if (R.isEmpty(state.change_event_queue)) {
        return self.Promise.resolve();
      }

      state.change_event_queue = R.uniqBy(R.compose(R.head, R.nth(1)), state.change_event_queue);

      var _R$head3 = R.head(state.change_event_queue);

      var _R$head4 = _slicedToArray(_R$head3, 2);

      var resolve = _R$head4[0];
      var args = _R$head4[1];

      return R.threadP(stateChangeEventP(args, state))(function () {
        state.change_event_queue = R.tail(state.change_event_queue);
        resolve();
        return processNextChangeEventP(state);
      });
    }
    function stateEventP(args, state) {
      console.info('State ===> Event', args[0], R.tail(args));
      return pubSubService.publishP.apply(null, [].concat(_toConsumableArray(args), [state]));
    }
    function stateChangeEventP(args, state) {
      console.log('StateChange <===', R.head(args), R.tail(args));
      return pubSubService.publishP.apply(null, [].concat(_toConsumableArray(args), [state.change]));
    }
    function stateOnChangeEvent(event, listener, state) {
      return pubSubService.subscribe(event, listener, state.change);
    }
    function stateOnLoadDumpFile(state, event, file) {}
    // return R.pipeP(
    //   fileImportService.read$('json'),
    //   (data) => {
    //     return R.pipeP(
    //       () => {
    //         return stateDataService
    //           .onSettingsReset(state, event, data.settings);
    //       },
    //       () => {
    //         return stateGamesService
    //           .loadNewLocalGame(state, data.game);
    //       },
    //       () => {
    //         state.changeEvent('State.loadDumpFile', 'File loaded');
    //       }
    //     )();
    //   }
    // )(file).catch((error) => {
    //   state.changeEvent('State.loadDumpFile', error);
    // });

    // const exportCurrentDumpFile = stateExportsService
    //         .export$('dump', (state) => {
    //           return { settings: R.pathOr({}, ['settings','current'], state),
    //                    game: R.propOr({}, 'game', state)
    //                  };
    //         });
  }
})();
//# sourceMappingURL=state.js.map
