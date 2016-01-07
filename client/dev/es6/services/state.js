angular.module('clickApp.services')
  .factory('state', [
    'pubSub',
    'fileImport',
    'stateExports',
    'stateData',
    'stateUser',
    'stateGame',
    'stateGames',
    'stateModes',
    function stateServiceFactory(pubSubService,
                                 fileImportService,
                                 stateExportsService,
                                 stateDataService,
                                 stateUserService,
                                 stateGameService,
                                 stateGamesService,
                                 stateModesService) {
      var stateService = {
        init: function stateInit() {
          let state = pubSubService.init({}, 'State');
          state.processing = false;
          state.change_queue = [];

          state.event = (...args) => {
            return stateService.event
              .apply(null, [...args, state]);
          };
          state.onEvent = (...args) => {
            return pubSubService.subscribe
              .apply(null, [...args, state]);
          };

          state.change = pubSubService.init({}, 'State.Change');
          state.changeEvent = (...args) => {
            if(state.processing) {
              console.info('State <--- ChangeEvent', args[0], R.tail(args));
              state.change_queue = R.append(args, state.change_queue);
              return self.Promise.resolve();
            }
            console.info('State <=== ChangeEvent', args[0], R.tail(args));
            return pubSubService.publish
              .apply(null, [...args, state.change]);
          };
          state.changeEventUnbuffered = (...args) => {
            console.info('State <---[U] ChangeEvent', args[0], R.tail(args));
            return pubSubService.publish
              .apply(null, [...args, state.change]);
          };

          state = stateDataService.init(state);
          state = stateUserService.init(state);
          state = stateGameService.init(state);
          state = stateGamesService.init(state);
          state = stateModesService.init(state);

          exportCurrentDumpFile(state);
          return state;
        },
        event: function stateEvent(...args) {
          let state = R.last(args);
          let processing = state.processing;
          state.processing = true;
          console.info('State ---> Event', args[0], R.init(R.tail(args)));
          // console.trace();
          return R.pipeP(
            () => {
              return pubSubService.publish
                .apply(null, args);
            },
            () => {
              if(processing) return self.Promise.reject();
              else return null;
            },
            () => { return stateDataService.save(state); },
            () => { return stateUserService.save(state); },
            () => { return stateGameService.save(state); },
            () => { return stateGamesService.save(state); },
            () => { return stateModesService.save(state); },
            () => { return exportCurrentDumpFile(state); },
            () => { state.processing = processing; },
            () => {
              state.change_queue = R.uniq(state.change_queue);
              return (function dispatchChange(queue) {
                if(R.isEmpty(queue)) return null;
                let args = R.head(queue);
                console.log('State: change queue <===', R.head(args));
                return pubSubService.publish
                  .apply(null, [...args, state.change])
                  .then(() => {
                    return dispatchChange(R.tail(queue));
                  });
              })(state.change_queue);
            },
            () => { state.change_queue = []; }
          )().catch(R.always(null))
            .then(() => { state.processing = processing; });
        },
        onChangeEvent: function stateOnChangeEvent(event, listener, state) {
          return pubSubService.subscribe(event, listener, state.change);
        },
        onLoadDumpFile: function stateOnLoadDumpFile(state, event, file) {
          return R.pipeP(
            fileImportService.read$('json'),
            (data) => {
              return R.pipeP(
                () => {
                  return stateDataService
                    .onSettingsReset(state, event, data.settings);
                },
                () => {
                  return stateGamesService
                    .loadNewLocalGame(state, data.game);
                },
                () => {
                  state.changeEvent('State.loadDumpFile', 'File loaded');
                }
              )();
            }
          )(file).catch((error) => {
            state.changeEvent('State.loadDumpFile', error);
          });
        }
      };
      var exportCurrentDumpFile = stateExportsService
            .export$('dump', (state) => {
              return { settings: R.pathOr({}, ['settings','current'], state),
                       game: R.propOr({}, 'game', state)
                     };
            });
      R.curryService(stateService);
      return stateService;
    }
  ]);
