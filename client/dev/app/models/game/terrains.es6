(function() {
  angular.module('clickApp.services')
    .factory('gameTerrains', gameTerrainsModelFactory);

  gameTerrainsModelFactory.$inject = [
    'point',
    'terrain',
  ];
  function gameTerrainsModelFactory(pointModel,
                                    terrainModel) {
    const gameTerrainsModel = {
      create: terrainsCreate,
      all: terrainsAll,
      findStampP: terrainsFindStampP,
      findAnyStampsP: terrainsFindAnyStampsP,
      fromStampsP: terrainsFromStampsP,
      onStampsP: terrainsOnStampsP,
      setStateStampsP: terrainsSetStateStampsP,
      lockStampsP: terrainsLockStampsP,
      add: terrainsAdd,
      removeStamps: terrainsRemoveStamps,
      copyStampsP: terrainsCopyStampsP
    };

    const fromStampsP$ = R.curry(fromStampsP);
    const updateTerrains$ = R.curry(updateTerrains);

    R.curryService(gameTerrainsModel);
    return gameTerrainsModel;

    function terrainsCreate() {
      return {
        active: [],
        locked: []
      };
    }
    function terrainsAll(terrains) {
      return R.concat(terrains.active, terrains.locked);
    }
    function terrainsFindStampP(stamp, terrains) {
      return new self.Promise(function(resolve, reject) {
        var terrain = R.thread(terrains)(
          gameTerrainsModel.all,
          R.find(R.pathEq(['state','stamp'], stamp))
        );
        if(R.isNil(terrain)) reject(`Terrain ${stamp} not found`);
        else resolve(terrain);
      });
    }
    function terrainsFindAnyStampsP(stamps, terrains) {
      return R.threadP(stamps)(
        R.map(findStampP),
        R.promiseAll,
        R.rejectIf(R.compose(R.isEmpty, R.reject(R.isNil)),
                  'No terrain found')
      );

      function findStampP(stamp) {
        return gameTerrainsModel
          .findStampP(stamp, terrains)
          .catch(R.always(null));
      }
    }
    function terrainsFromStampsP(method, args, stamps, terrains) {
      return fromStampsP(() => R.always(null),
                         method, args, stamps, terrains);
    }
    function terrainsOnStampsP(method, args, stamps, terrains) {
      return R.threadP(terrains)(
        fromStampsP$(R.always, method, args, stamps),
        updateTerrains$(terrains)
      );
    }
    function terrainsSetStateStampsP(states, stamps, terrains) {
      return R.threadP(terrains)(
        gameTerrainsModel.findAnyStampsP$(stamps),
        R.addIndex(R.map)(setStateIndex),
        R.reject(R.isNil),
        updateTerrains$(terrains)
      );

      function setStateIndex(terrain, index) {
        return ( R.isNil(terrain)
                 ? null
                 : terrainModel.setState(states[index], terrain)
               );
      }
    }
    function terrainsLockStampsP(lock, stamps, terrains) {
      return R.threadP(terrains)(
        gameTerrainsModel.findAnyStampsP$(stamps),
        R.reject(R.isNil),
        R.map(terrainModel.setLock$(lock)),
        updateTerrains$(terrains)
      );
    }
    function terrainsAdd(news, terrains) {
      const new_stamps = R.map(R.path(['state','stamp']), news);
      return R.thread(terrains)(
        gameTerrainsModel.removeStamps$(new_stamps),
        R.flip(updateTerrains$)(news)
      );
    }
    function terrainsRemoveStamps(stamps, terrains) {
      return R.thread(terrains)(
        R.over(R.lensProp('active'), R.reject(inStamps)),
        R.over(R.lensProp('locked'), R.reject(inStamps))
      );

      function inStamps(terrain) {
        return R.find(R.equals(R.path(['state', 'stamp'], terrain)), stamps);
      }
    }
    function terrainsCopyStampsP(stamps, terrains) {
      return R.threadP(terrains)(
        gameTerrainsModel.findAnyStampsP$(stamps),
        R.reject(R.isNil),
        makeCreate
      );

      function makeCreate(selection) {
        const base = R.pick(['x','y','r'], selection[0].state);

        return {
          base: base,
          terrains: R.map(R.compose(pointModel.differenceFrom$(base),
                                    terrainModel.saveState),
                          selection)
        };
      }
    }
    function fromStampsP(onError, method, args, stamps, terrains) {
      return R.threadP()(
        checkIfMethodExists,
        R.always(terrains),
        gameTerrainsModel.findAnyStampsP$(stamps),
        R.reject(R.isNil),
        R.map(callMethodOnTerrainP),
        R.promiseAll
      );

      function checkIfMethodExists() {
        return R.threadP(terrainModel)(
          R.prop(method),
          R.type,
          R.rejectIf(R.complement(R.equals('Function')),
                     `Unknown method "${method}" on terrains`)
        );
      }
      function callMethodOnTerrainP(terrain) {
        return self.Promise
          .resolve(terrainModel[method].apply(null, [...args, terrain]))
          .catch(onError(terrain));
      }
    }
    function updateTerrains(terrains, news) {
      return R.thread(terrains)(
        gameTerrainsModel.all,
        R.concat(news),
        R.uniqBy(R.path(['state','stamp'])),
        R.partition(terrainModel.isLocked),
        ([locked, active]) => {
          return {
            active: active,
            locked: locked
          };
        }
      );
    }
  }
})();
