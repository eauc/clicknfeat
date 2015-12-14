'use strict';

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
            locked: [],
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
            if(R.isNil(model)) reject('Model '+stamp+' not found');
            else resolve(model);
          });
        },
        findAnyStamps: function modelsFindAnyStamps(stamps, models) {
          return R.pipeP(
            R.bind(self.Promise.resolve, self.Promise),
            R.map(function(stamp) {
              return gameModelsService.findStamp(stamp, models)
                .catch(R.always(null));
            }),
            R.bind(self.Promise.all, self.Promise),
            function(models) {
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
        onStamps: function modelsOnStamps(method /*, ...args..., stamps, models*/) {
          if('Function' !== R.type(modelService[method])) {
            return self.Promise.reject('Unknown method '+method+' on models');
          }
          
          var args = Array.prototype.slice.call(arguments);
          var models = R.last(args);
          var stamps = R.nth(-2, args);

          args = R.slice(1, -2, args);
          var reason;
          return R.pipeP(
            gameModelsService.findAnyStamps$(stamps),
            R.reject(R.isNil),
            R.map(function(model) {
              return self.Promise.resolve(modelService[method]
                                          .apply(null, R.append(model, args)))
                .catch(function(_reason) {
                  console.error(_reason);
                  reason = _reason;
                  return '##failed##';
                });
            }),
            R.bind(self.Promise.all, self.Promise),
            function(results) {
              if(R.isEmpty(R.reject(R.equals('##failed##'), results))) {
                console.error('Models: onStamps all failed', args);
                return self.Promise.reject(reason);
              }
              return R.map(function(res) {
                return ( res === '##failed##' ?
                         null : res
                       );
              }, results);
            }
          )(models);
        },
        lockStamps: function modelsLockStamps(lock, stamps, models) {
          return R.pipeP(
            function() {
              return gameModelsService.findAnyStamps(stamps, models);
            },
            R.reject(R.isNil),
            R.forEach(modelService.setLock$(lock)),
            function() {
              var partition = R.pipe(
                gameModelsService.all,
                R.partition(modelService.isLocked)
              )(models);
              return {
                active: partition[1],
                locked: partition[0]
              };
            }
          )();
        },
        add: function modelsAdd(mods, models) {
          return R.pipe(
            gameModelsService.removeStamps$(R.map(R.path(['state','stamp']), mods)),
            function(models) {
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
            function() {
              return gameModelsService.findStamp(stamp, models);
            },
            modelService.modeFor$
          )();
        },
        copyStamps: function modelsCopyStamps(stamps, models) {
          return R.pipeP(
            gameModelsService.findAnyStamps$(stamps),
            R.reject(R.isNil),
            function(selection) {
              var base = R.pick(['x','y','r'], selection[0].state);

              return {
                base: base,
                models: R.map(R.compose(pointService.differenceFrom$(base),
                                        modelService.saveState),
                              selection)
              };
            }
          )(models);
        },
      };
      R.curryService(gameModelsService);
      return gameModelsService;
    }
  ]);
