'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.services').factory('state', stateModelFactory);

  stateModelFactory.$inject = ['pubSub', 'fileImport', 'stateExports', 'stateData', 'stateUser', 'stateGame', 'stateGames', 'stateModes'];
  function stateModelFactory(pubSubService, fileImportService, stateExportsService, stateDataModel, stateUserModel, stateGameModel, stateGamesModel, stateModesModel) {
    var stateModel = {
      create: stateCreate,
      queueEventP: stateQueueEventP,
      queueChangeEventP: stateQueueChangeEventP,
      onChangeEvent: stateOnChangeEvent,
      onLoadDumpFile: stateOnLoadDumpFile
    };
    var exportCurrentDumpFile = stateExportsService.exportP$('dump', buildDumpData);
    R.curryService(stateModel);
    return stateModel;

    function stateCreate() {
      var state = pubSubService.init({
        event_queue: [],
        onEvent: onEvent,
        change: pubSubService.init({}, 'State.Change'),
        change_event_queue: [],
        onChangeEvent: onChangeEvent,
        eventP: eventP,
        queueEventP: queueEventP,
        changeEventP: changeEventP,
        queueChangeEventP: queueChangeEventP
      }, 'State');
      state = R.thread(state)(
      // starting here State is mutable
      stateDataModel.create, stateUserModel.create, stateGameModel.create, stateGamesModel.create, stateModesModel.create);
      state.onEvent('State.loadDumpFile', stateModel.onLoadDumpFile$(state));
      return state;

      function onEvent() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return pubSubService.subscribe.apply(null, [].concat(args, [state]));
      }
      function onChangeEvent() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return pubSubService.subscribe.apply(null, [].concat(args, [state.change]));
      }
      function queueEventP() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        return stateQueueEventP(args, state);
      }
      function queueChangeEventP() {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        return stateQueueChangeEventP(args, state);
      }
      function eventP() {
        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        return stateEventP(args, state);
      }
      function changeEventP() {
        for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
          args[_key6] = arguments[_key6];
        }

        return stateChangeEventP(args, state);
      }
    }
    function stateQueueEventP(args, state) {
      return new self.Promise(function (resolve) {
        console.info('State ---> Event', args[0], R.tail(args));
        console.trace();
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

      return R.threadP(stateEventP(args, state))(function () {
        return stateDataModel.save(state);
      }, function () {
        return stateUserModel.save(state);
      }, function () {
        return stateGameModel.save(state);
      }, function () {
        return stateGamesModel.save(state);
      }, function () {
        return stateModesModel.save(state);
      }, function () {
        return exportCurrentDumpFile(state);
      }, function () {
        return processNextChangeEventP(state);
      }).catch(R.spyAndDiscardError('processNextEvent')).then(function () {
        state.event_queue = R.tail(state.event_queue);
        resolve();
        return processNextEventP(state);
      });
    }
    function stateQueueChangeEventP(args, state) {
      return new self.Promise(function (resolve) {
        console.info('StateChange <---', args[0], R.tail(args));
        console.trace();
        state.change_event_queue = R.append([resolve, args], state.change_event_queue);
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
      console.info('StateChange <===', R.head(args), R.tail(args));
      return pubSubService.publishP.apply(null, [].concat(_toConsumableArray(args), [state.change]));
    }
    function stateOnChangeEvent(event, listener, state) {
      return pubSubService.subscribe(event, listener, state.change);
    }
    function stateOnLoadDumpFile(state, event, file) {
      return R.threadP(file)(fileImportService.readP$('json'), dispatchData, function () {
        state.queueChangeEventP('State.loadDumpFile', 'File loaded');
      }).catch(function (error) {
        state.queueChangeEventP('State.loadDumpFile', error);
      });

      function dispatchData(data) {
        return R.threadP()(function () {
          return stateDataModel.onSettingsReset(state, event, data.settings);
        }, function () {
          return stateGamesModel.loadNewLocalGame(state, data.game);
        });
      }
    }
    function buildDumpData(state) {
      return {
        settings: R.pathOr({}, ['settings', 'current'], state),
        game: R.propOr({}, 'game', state)
      };
    }
  }
})();
//# sourceMappingURL=state.js.map
