angular.module('clickApp.services')
  .factory('gameTerrains', [
    'point',
    'terrain',
    function gameTerrainsServiceFactory(pointService,
                                        terrainService) {
      var gameTerrainsService = {
        create: function() {
          return {
            active: [],
            locked: []
          };
        },
        all: function terrainsAll(terrains) {
          return R.concat(terrains.active, terrains.locked);
        },
        findStamp: function terrainsFindStamp(stamp, terrains) {
          return new self.Promise(function(resolve, reject) {
            var terrain = R.pipe(
              gameTerrainsService.all,
              R.find(R.pathEq(['state','stamp'], stamp))
            )(terrains);
            if(R.isNil(terrain)) reject(`Terrain ${stamp} not found`);
            else resolve(terrain);
          });
        },
        findAnyStamps: function terrainsFindAnyStamps(stamps, terrains) {
          return R.pipePromise(
            R.map((stamp) => {
              return gameTerrainsService
                .findStamp(stamp, terrains)
                .catch(R.always(null));
            }),
            R.promiseAll,
            (terrains) => {
              if(R.isEmpty(R.reject(R.isNil, terrains))) {
                return self.Promise.reject('No terrain found');
              }
              return terrains;
            }
          )(stamps);
        },
        fromStamps: function terrainsFromStamps(method, args, stamps, terrains) {
          return fromStamps$(R.compose(R.always, R.always(null)),
                             method, args, stamps, terrains);
        },
        onStamps: function terrainsOnStamps(method, args, stamps, terrains) {
          return R.pipeP(
            fromStamps$(R.always, method, args, stamps),
            updateTerrains$(terrains)
          )(terrains);
        },
        setStateStamps: function terrainsSetStateStamps(states, stamps, terrains) {
          return R.pipeP(
            gameTerrainsService.findAnyStamps$(stamps),
            R.addIndex(R.map)((terrain, index) => {
              return ( R.isNil(terrain) ?
                       null :
                       terrainService.setState(states[index], terrain)
                     );
            }),
            R.reject(R.isNil),
            updateTerrains$(terrains)
          )(terrains);
        },
        lockStamps: function terrainsLockStamps(lock, stamps, terrains) {
          return R.pipeP(
            gameTerrainsService.findAnyStamps$(stamps),
            R.reject(R.isNil),
            R.map(terrainService.setLock$(lock)),
            updateTerrains$(terrains)
          )(terrains);
        },
        add: function terrainsAdd(news, terrains) {
          return R.pipe(
            gameTerrainsService.removeStamps$(R.map(R.path(['state','stamp']), news)),
            R.flip(updateTerrains$)(news)
          )(terrains);
        },
        removeStamps: function terrainsRemoveStamps(stamps, terrains) {
          function inStamps(terrain) {
            return R.find(R.equals(R.path(['state', 'stamp'], terrain)), stamps);
          }
          return R.pipe(
            R.assoc('active', R.reject(inStamps, terrains.active)),
            R.assoc('locked', R.reject(inStamps, terrains.locked))
          )(terrains);
        },
        copyStamps: function terrainsCopyStamps(stamps, terrains) {
          return R.pipeP(
            gameTerrainsService.findAnyStamps$(stamps),
            R.reject(R.isNil),
            (selection) => {
              var base = R.pick(['x','y','r'], selection[0].state);

              return {
                base: base,
                terrains: R.map(R.compose(pointService.differenceFrom$(base),
                                        terrainService.saveState),
                              selection)
              };
            }
          )(terrains);
        }
      };
      var fromStamps$ = R.curry((onError, method, args, stamps, terrains) => {
        if('Function' !== R.type(terrainService[method])) {
          return self.Promise.reject(`Unknown method ${method} on terrains`);
        }
          
        return R.pipeP(
          gameTerrainsService.findAnyStamps$(stamps),
          R.reject(R.isNil),
          R.map((terrain) => {
            return self.Promise
              .resolve(terrainService[method].apply(null, [...args, terrain]))
              .catch(onError(terrain));
          }),
          R.promiseAll
        )(terrains);
      });
      var updateTerrains$ = R.curry((terrains, news) => {
        return R.pipe(
          gameTerrainsService.all,
          R.concat(news),
          R.uniqBy(R.path(['state','stamp'])),
          R.partition(terrainService.isLocked),
          ([locked, active]) => {
            return {
              active: active,
              locked: locked
            };
          }
        )(terrains);
      });
      R.curryService(gameTerrainsService);
      return gameTerrainsService;
    }
  ]);
