(function() {
  angular.module('clickApp.services')
    .factory('gameElements', gameElementsModelFactory);

  gameElementsModelFactory.$inject = [
    'point',
  ];
  function gameElementsModelFactory(pointModel) {
    return function buildGameElementsModel(type, model) {
      const gameElementsModel = {
        create: elementsCreate,
        all: elementsAll,
        findStamp: elementsFindStamp,
        findAnyStamps: elementsFindAnyStamps,
        fromStampsP: elementsFromStampsP,
        onStampsP: elementsOnStampsP,
        setStateStamps: elementsSetStateStamps,
        lockStamps: elementsLockStamps,
        add: elementsAdd,
        removeStamps: elementsRemoveStamps,
        copyStamps: elementsCopyStamps
      };

      const fromStampsP$ = R.curry(fromStampsP);
      const updateElements$ = R.curry(updateElements);

      R.curryService(gameElementsModel);
      return gameElementsModel;

      function elementsCreate() {
        return {
          active: [],
          locked: []
        };
      }
      function elementsAll(elements) {
        return R.concat(elements.active, elements.locked);
      }
      function elementsFindStamp(stamp, elements) {
        return R.thread(elements)(
          gameElementsModel.all,
          R.find(R.pathEq(['state','stamp'], stamp))
        );
      }
      function elementsFindAnyStamps(stamps, elements) {
        return R.map(gameElementsModel.findStamp$(R.__, elements), stamps);
      }
      function elementsFromStampsP(method, args, stamps, elements) {
        return fromStampsP(() => R.always(null),
                           method, args, stamps, elements);
      }
      function elementsOnStampsP(method, args, stamps, elements) {
        return R.threadP(elements)(
          fromStampsP$(R.always, method, args, stamps),
          updateElements$(elements)
        );
      }
      function elementsSetStateStamps(states, stamps, elements) {
        return R.thread(elements)(
          gameElementsModel.findAnyStamps$(stamps),
          R.addIndex(R.map)(setStateIndex),
          R.reject(R.isNil),
          updateElements$(elements)
        );

        function setStateIndex(element, index) {
          return ( R.isNil(element)
                   ? null
                   : model.setState(states[index], element)
                 );
        }
      }
      function elementsLockStamps(lock, stamps, elements) {
        return R.thread(elements)(
          gameElementsModel.findAnyStamps$(stamps),
          R.reject(R.isNil),
          R.map(model.setLock$(lock)),
          updateElements$(elements)
        );
      }
      function elementsAdd(news, elements) {
        const new_stamps = R.map(R.path(['state','stamp']), news);
        return R.thread(elements)(
          gameElementsModel.removeStamps$(new_stamps),
          updateElements$(R.__, news)
        );
      }
      function elementsRemoveStamps(stamps, elements) {
        return R.thread(elements)(
          R.over(R.lensProp('active'), R.reject(inStamps)),
          R.over(R.lensProp('locked'), R.reject(inStamps))
        );

        function inStamps(element) {
          return R.find(R.equals(R.path(['state', 'stamp'], element)), stamps);
        }
      }
      function elementsCopyStamps(stamps, elements) {
        return R.thread(elements)(
          gameElementsModel.findAnyStamps$(stamps),
          R.reject(R.isNil),
          makeCreate
        );

        function makeCreate(selection) {
          const base = R.thread(selection)(
            R.head,
            R.defaultTo({ state: { x: 240, y: 240, r: 0 } }),
            R.prop('state'),
            R.pick(['x','y','r'])
          );
          return {
            base: base,
            [`${type}s`]: R.map(R.compose(pointModel.differenceFrom$(base),
                                          model.saveState),
                                selection)
          };
        }
      }
      function fromStampsP(onError, method, args, stamps, elements) {
        return R.threadP()(
          checkIfMethodExists,
          () => gameElementsModel.findAnyStamps(stamps, elements),
          R.reject(R.isNil),
          R.map(callMethodOnElementP),
          R.allP
        );

        function checkIfMethodExists() {
          return R.threadP(model)(
            R.prop(method),
            R.type,
            R.rejectIfP(R.complement(R.equals('Function')),
                       `Unknown method "${method}" on ${type}s`)
          );
        }
        function callMethodOnElementP(element) {
          return R.resolveP(model[method].apply(model, [...args, element]))
            .catch(onError(element));
        }
      }
      function updateElements(elements, news) {
        return R.thread(elements)(
          gameElementsModel.all,
          R.concat(news),
          R.uniqBy(R.path(['state','stamp'])),
          R.partition(model.isLocked),
          ([locked, active]) => ({
            active: active,
            locked: locked
          })
        );
      }
    };
  }
})();
