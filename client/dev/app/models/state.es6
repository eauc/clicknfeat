(function() {
  angular.module('clickApp.services')
    .factory('state', stateModelFactory);

  stateModelFactory.$inject = [
    'pubSub',
    'fileImport',
    'stateExports',
    'stateData',
    'stateUser',
    'stateGame',
    'stateGames',
    'stateModes',
  ];
  function stateModelFactory(pubSubService,
                             fileImportService,
                             stateExportsService,
                             stateDataModel,
                             stateUserModel,
                             stateGameModel,
                             stateGamesModel,
                             stateModesModel) {
    const stateModel = {
      create: stateCreate,
      queueEventP: stateQueueEventP,
      queueChangeEventP: stateQueueChangeEventP,
      onChangeEvent: stateOnChangeEvent,
      onLoadDumpFile: stateOnLoadDumpFile
    };
    const exportCurrentDumpFile = stateExportsService
            .exportP$('dump', buildDumpData);
    R.curryService(stateModel);
    return stateModel;

    function stateCreate() {
      let state = pubSubService.init({
        event_queue: [],
        onEvent: onEvent,
        change: pubSubService.init({}, 'State.Change'),
        change_event_queue: [],
        eventP: eventP,
        queueEventP: queueEventP,
        changeEventP: changeEventP,
        queueChangeEventP: queueChangeEventP
      }, 'State');
      state = R.thread(state)(
        // starting here State is mutable
        stateDataModel.create,
        stateUserModel.create,
        stateGameModel.create,
        stateGamesModel.create,
        stateModesModel.create
      );
      state.onEvent('State.loadDumpFile',
                    stateModel.onLoadDumpFile$(state));
      return state;

      function onEvent(...args) {
        return pubSubService.subscribe
          .apply(null, [...args, state]);
      }
      function queueEventP(...args) {
        return stateQueueEventP(args, state);
      }
      function queueChangeEventP(...args) {
        return stateQueueChangeEventP(args, state);
      }
      function eventP(...args) {
        return stateEventP(args, state);
      }
      function changeEventP(...args) {
        return stateChangeEventP(args, state);
      }
    }
    function stateQueueEventP(args, state) {
      return new self.Promise((resolve) => {
        console.info('State ---> Event', args[0], R.tail(args));
        console.trace();
        state.event_queue = R.append([
          resolve, args
        ], state.event_queue);
        startEventQueueProcessing(state);
      });
    }
    function startEventQueueProcessing(state) {
      if(state.processing_event_queue) return;
      state.processing_event_queue = true;
      self.Promise.resolve(processNextEventP(state))
        .then(() => { state.processing_event_queue = false; });
    }
    function processNextEventP(state) {
      if(R.isEmpty(state.event_queue)) {
        return self.Promise.resolve();
      }

      const [ resolve, args ] = R.head(state.event_queue);
      return R.threadP(stateEventP(args, state))(
        () => { return stateDataModel.save(state); },
        () => { return stateUserModel.save(state); },
        () => { return stateGameModel.save(state); },
        () => { return stateGamesModel.save(state); },
        () => { return stateModesModel.save(state); },
        () => { return exportCurrentDumpFile(state); },
        () => { return processNextChangeEventP(state); }
      ).catch(R.spyAndDiscardError('processNextEvent'))
        .then(() => {
          state.event_queue = R.tail(state.event_queue);
          resolve();
          return processNextEventP(state);
        });
    }
    function stateQueueChangeEventP(args, state) {
      return new self.Promise((resolve) => {
        console.info('StateChange <---', args[0], R.tail(args));
        console.trace();
        state.change_event_queue = R.append([
          resolve, args
        ], state.change_event_queue);
      });
    }
    function processNextChangeEventP(state) {
      if(R.isEmpty(state.change_event_queue)) {
        return self.Promise.resolve();
      }

      state.change_event_queue = R.uniqBy(R.compose(R.head, R.nth(1)),
                                          state.change_event_queue);
      let [ resolve, args ] = R.head(state.change_event_queue);
      return R.threadP(stateChangeEventP(args, state))(
        () => {
          state.change_event_queue = R.tail(state.change_event_queue);
          resolve();
          return processNextChangeEventP(state);
        }
      );
    }
    function stateEventP(args, state) {
      console.info('State ===> Event', args[0], R.tail(args));
      return pubSubService.publishP
        .apply(null, [...args, state]);
    }
    function stateChangeEventP(args, state) {
      console.info('StateChange <===', R.head(args), R.tail(args));
      return pubSubService.publishP
        .apply(null, [...args, state.change]);
    }
    function stateOnChangeEvent(event, listener, state) {
      return pubSubService
        .subscribe(event, listener, state.change);
    }
    function stateOnLoadDumpFile(state, event, file) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        dispatchData,
        () => {
          state.queueChangeEventP('State.loadDumpFile', 'File loaded');
        }
      ).catch((error) => {
        state.queueChangeEventP('State.loadDumpFile', error);
      });

      function dispatchData(data) {
        return R.threadP()(
          () => {
            return stateDataModel
              .onSettingsReset(state, event, data.settings);
          },
          () => {
            return stateGamesModel
              .loadNewLocalGame(state, data.game);
          }
        );
      }
    }
    function buildDumpData(state) {
      return {
        settings: R.pathOr({}, ['settings','current'], state),
        game: R.propOr({}, 'game', state)
      };
    }
  }
})();
