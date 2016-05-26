'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
  angular.module('clickApp.services').factory('gameElements', gameElementsModelFactory);

  gameElementsModelFactory.$inject = ['point'];
  function gameElementsModelFactory(pointModel) {
    var ACTIVE_LENS = R.lensProp('active');
    var LOCKED_LENS = R.lensProp('locked');
    var STAMP_PATH = R.path(['state', 'stamp']);
    return function buildGameElementsModel(type, model) {
      var gameElementsModel = {
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

      var fromStampsP$ = R.curry(fromStampsP);
      var updateElements$ = R.curry(updateElements);

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
        return R.thread(elements)(gameElementsModel.all, R.find(R.pathEq(['state', 'stamp'], stamp)));
      }
      function elementsFindAnyStamps(stamps, elements) {
        return R.map(gameElementsModel.findStamp$(R.__, elements), stamps);
      }
      function elementsFromStampsP(method, args, stamps, elements) {
        return fromStampsP(function () {
          return R.always(null);
        }, method, args, stamps, elements);
      }
      function elementsOnStampsP(method, args, stamps, elements) {
        return R.threadP(elements)(fromStampsP$(R.always, method, args, stamps), updateElements$(elements));
      }
      function elementsSetStateStamps(states, stamps, elements) {
        return R.thread(elements)(gameElementsModel.findAnyStamps$(stamps), R.addIndex(R.map)(setStateIndex), R.reject(R.isNil), updateElements$(elements));

        function setStateIndex(element, index) {
          return R.isNil(element) ? null : model.setState(states[index], element);
        }
      }
      function elementsLockStamps(lock, stamps, elements) {
        return R.thread(elements)(gameElementsModel.findAnyStamps$(stamps), R.reject(R.isNil), R.map(model.setLock$(lock)), updateElements$(elements));
      }
      function elementsAdd(news, elements) {
        var new_stamps = R.map(STAMP_PATH, news);
        return R.thread(elements)(gameElementsModel.removeStamps$(new_stamps), updateElements$(R.__, news));
      }
      function elementsRemoveStamps(stamps, elements) {
        return R.thread(elements)(R.over(ACTIVE_LENS, R.reject(inStamps)), R.over(LOCKED_LENS, R.reject(inStamps)));

        function inStamps(element) {
          return R.find(R.equals(STAMP_PATH(element)), stamps);
        }
      }
      function elementsCopyStamps(stamps, elements) {
        return R.thread(elements)(gameElementsModel.findAnyStamps$(stamps), R.reject(R.isNil), makeCreate);

        function makeCreate(selection) {
          var base = R.thread(selection)(R.head, R.defaultTo({ state: { x: 240, y: 240, r: 0 } }), R.prop('state'), R.pick(['x', 'y', 'r']));
          return _defineProperty({
            base: base
          }, type + 's', R.map(R.compose(pointModel.differenceFrom$(base), model.saveState), selection));
        }
      }
      function fromStampsP(onError, method, args, stamps, elements) {
        return R.threadP()(checkIfMethodExists, function () {
          return gameElementsModel.findAnyStamps(stamps, elements);
        }, R.reject(R.isNil), R.map(callMethodOnElementP), R.allP);

        function checkIfMethodExists() {
          return R.threadP(model)(R.prop(method), R.type, R.rejectIfP(R.complement(R.equals('Function')), 'Unknown method "' + method + '" on ' + type + 's'));
        }
        function callMethodOnElementP(element) {
          return R.resolveP(model[method].apply(model, [].concat(_toConsumableArray(args), [element]))).catch(onError(element));
        }
      }
      function updateElements(elements, news) {
        return R.thread(elements)(gameElementsModel.all, R.concat(news), R.uniqBy(STAMP_PATH), R.partition(model.isLocked), function (_ref2) {
          var _ref3 = _slicedToArray(_ref2, 2);

          var locked = _ref3[0];
          var active = _ref3[1];
          return {
            active: active,
            locked: locked
          };
        });
      }
    };
  }
})();
//# sourceMappingURL=elements.js.map
