(function() {
  angular.module('clickApp.services')
    .factory('state', stateServiceFactory);

  stateServiceFactory.$inject = [
    'pubSub',
    // 'fileImport',
    // 'stateExports',
    // 'stateData',
    'stateUser',
    'stateGame',
    'stateGames',
    'stateModes',
  ];
  function stateServiceFactory(pubSubService,
                               // fileImportService,
                               // stateExportsService,
                               // stateDataService,
                               stateUserService,
                               stateGameService,
                               stateGamesService,
                               stateModesService) {
    const stateService = {
      create: stateCreate,
      queueEventP: stateQueueEventP,
      onChangeEvent: stateOnChangeEvent,
      // onLoadDumpFile: stateOnLoadDumpFile
    };
    R.curryService(stateService);
    return stateService;

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
        // stateDataService.create,
        stateUserService.create,
        stateGameService.create,
        stateGamesService.create,
        stateModesService.create
      );

      // exportCurrentDumpFile(state);
      return state;

      function onEvent(...args) {
        return pubSubService.subscribe
          .apply(null, [...args, state]);
      }
      function queueEventP(...args) {
        return stateQueueEventP(args, state);
      }
      function queueChangeEventP(...args) {
        return new self.Promise((resolve) => {
          console.info('StateChange <---', args[0], R.tail(args));
          state.change_event_queue = R.append([
            resolve, args
          ], state.change_event_queue);
        });
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
        // () => { return stateDataService.save(state); },
        () => { return stateUserService.save(state); },
        // () => { return stateGameService.save(state); },
        () => { return stateGamesService.save(state); },
        () => { return stateModesService.save(state); },
        // () => { return exportCurrentDumpFile(state); },
        () => { return processNextChangeEventP(state); }
      ).catch(R.spyAndDiscardError('processNextEvent'))
        .then(() => {
          state.event_queue = R.tail(state.event_queue);
          resolve();
          return processNextEventP(state);
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
      console.log('StateChange <===', R.head(args), R.tail(args));
      return pubSubService.publishP
        .apply(null, [...args, state.change]);
    }
    function stateOnChangeEvent(event, listener, state) {
      return pubSubService
        .subscribe(event, listener, state.change);
    }
    function stateOnLoadDumpFile(state, event, file) {
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
    }
    // const exportCurrentDumpFile = stateExportsService
    //         .export$('dump', (state) => {
    //           return { settings: R.pathOr({}, ['settings','current'], state),
    //                    game: R.propOr({}, 'game', state)
    //                  };
    //         });
  }
})();
