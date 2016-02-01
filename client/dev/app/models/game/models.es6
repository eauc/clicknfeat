angular.module('clickApp.services')
  .factory('gameModels', [
    'point',
    'model',
    function gameModelsServiceFactory(pointService,
                                      modelService) {
      var gameModelsService = {
        create: function() {
          return {
            active: [],
            locked: []
          };
        },
        all: function modelsAll(models) {
          return R.concat(models.active, models.locked);
        },
        findStamp: function modelsFindStamp(stamp, models) {
          return new self.Promise(function(resolve, reject) {
            var model = R.pipe(
              gameModelsService.all,
              R.find(R.pathEq(['state','stamp'], stamp))
            )(models);
            if(R.isNil(model)) reject(`Model ${stamp} not found`);
            else resolve(model);
          });
        },
        findAnyStamps: function modelsFindAnyStamps(stamps, models) {
          return R.pipePromise(
            R.map((stamp) => {
              return gameModelsService.findStamp(stamp, models)
                .catch(R.always(null));
            }),
            R.promiseAll,
            (models) => {
              if(R.isEmpty(R.reject(R.isNil, models))) {
                return self.Promise.reject('No model found');
              }
              return models;
            }
          )(stamps);
        },
        findStampsBetweenPoints: function modelsFindStampBetweenPoints(top_left, bottom_right, models) {
          return new self.Promise(function(resolve, reject) {
            models = gameModelsService.all(models);
            var stamps = R.pipe(
              R.filter(modelService.isBetweenPoints$(top_left, bottom_right)),
              R.map(R.path(['state','stamp']))
            )(models);
            if(R.isEmpty(stamps)) reject('No model found between points');
            else resolve(stamps);
          });
        },
        fromStamps: function modelsFromStamps(method, args, stamps, models) {
          return fromStamps$(R.compose(R.always, R.always(null)),
                             method, args, stamps, models);
        },
        onStamps: function modelsOnStamps(method, args, stamps, models) {
          return R.pipeP(
            fromStamps$(R.always, method, args, stamps),
            updateModels$(models)
          )(models);
        },
        setStateStamps: function modelsSetStateStamps(states, stamps, models) {
          return R.pipeP(
            gameModelsService.findAnyStamps$(stamps),
            R.addIndex(R.map)((model, index) => {
              return ( R.isNil(model) ?
                       null :
                       modelService.setState(states[index], model)
                     );
            }),
            R.reject(R.isNil),
            updateModels$(models)
          )(models);
        },
        lockStamps: function modelsLockStamps(lock, stamps, models) {
          return R.pipeP(
            gameModelsService.findAnyStamps$(stamps),
            R.reject(R.isNil),
            R.map(modelService.setLock$(lock)),
            updateModels$(models)
          )(models);
        },
        add: function modelsAdd(mods, models) {
          return R.pipe(
            gameModelsService.removeStamps$(R.map(R.path(['state','stamp']), mods)),
            (models) => {
              return R.assoc('active', R.concat(models.active, mods), models);
            }
          )(models);
        },
        removeStamps: function modelsRemoveStamps(stamps, models) {
          function inStamps(model) {
            return R.find(R.equals(R.path(['state', 'stamp'], model)), stamps);
          }
          return R.pipe(
            R.assoc('active', R.reject(inStamps, models.active)),
            R.assoc('locked', R.reject(inStamps, models.locked))
          )(models);
        },
        modeForStamp: function modelsModeForStamp(stamp, models) {
          return R.pipeP(
            () => {
              return gameModelsService.findStamp(stamp, models);
            },
            modelService.modeFor$
          )();
        },
        copyStamps: function modelsCopyStamps(stamps, models) {
          return R.pipeP(
            gameModelsService.findAnyStamps$(stamps),
            R.reject(R.isNil),
            (selection) => {
              var base = R.pick(['x','y','r'], selection[0].state);

              return {
                base: base,
                models: R.map(R.compose(pointService.differenceFrom$(base),
                                        modelService.saveState),
                              selection)
              };
            }
          )(models);
        }
      };
      var fromStamps$ = R.curry((onError, method, args, stamps, models) => {
        if('Function' !== R.type(modelService[method])) {
          return self.Promise.reject(`Unknown method ${method} on models`);
        }
          
        return R.pipeP(
          gameModelsService.findAnyStamps$(stamps),
          R.reject(R.isNil),
          R.map((model) => {
            return self.Promise
              .resolve(modelService[method].apply(null, [...args, model]))
              .catch(onError(model));
          }),
          R.promiseAll
        )(models);
      });
      var updateModels$ = R.curry((models, news) => {
        return R.pipe(
          gameModelsService.all,
          R.concat(news),
          R.uniqBy(R.path(['state','stamp'])),
          R.partition(modelService.isLocked),
          ([locked, active]) => {
            return {
              active: active,
              locked: locked
            };
          }
        )(models);
      });
      R.curryService(gameModelsService);
      return gameModelsService;
    }
  ]);
