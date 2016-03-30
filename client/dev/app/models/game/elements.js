'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
  angular.module('clickApp.services').factory('gameElements', gameElementsModelFactory);

  gameElementsModelFactory.$inject = ['point'];
  function gameElementsModelFactory(pointModel) {
    return function buildGameElementsModel(type, model) {
      var gameElementsModel = {
        create: elementsCreate,
        all: elementsAll,
        findStampP: elementsFindStampP,
        findAnyStampsP: elementsFindAnyStampsP,
        fromStampsP: elementsFromStampsP,
        onStampsP: elementsOnStampsP,
        setStateStampsP: elementsSetStateStampsP,
        lockStampsP: elementsLockStampsP,
        add: elementsAdd,
        removeStamps: elementsRemoveStamps,
        copyStampsP: elementsCopyStampsP
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
      function elementsFindStampP(stamp, elements) {
        return new self.Promise(function (resolve, reject) {
          var element = R.thread(elements)(gameElementsModel.all, R.find(R.pathEq(['state', 'stamp'], stamp)));
          if (R.isNil(element)) reject(s.capitalize(type) + ' "' + stamp + '" not found');else resolve(element);
        });
      }
      function elementsFindAnyStampsP(stamps, elements) {
        return R.threadP(stamps)(R.map(findStampP), R.promiseAll, R.rejectIfP(R.compose(R.isEmpty, R.reject(R.isNil)), 'No ' + type + ' found'));

        function findStampP(stamp) {
          return gameElementsModel.findStampP(stamp, elements).catch(R.always(null));
        }
      }
      function elementsFromStampsP(method, args, stamps, elements) {
        return fromStampsP(function () {
          return R.always(null);
        }, method, args, stamps, elements);
      }
      function elementsOnStampsP(method, args, stamps, elements) {
        return R.threadP(elements)(fromStampsP$(R.always, method, args, stamps), updateElements$(elements));
      }
      function elementsSetStateStampsP(states, stamps, elements) {
        return R.threadP(elements)(gameElementsModel.findAnyStampsP$(stamps), R.addIndex(R.map)(setStateIndex), R.reject(R.isNil), updateElements$(elements));

        function setStateIndex(element, index) {
          return R.isNil(element) ? null : model.setState(states[index], element);
        }
      }
      function elementsLockStampsP(lock, stamps, elements) {
        return R.threadP(elements)(gameElementsModel.findAnyStampsP$(stamps), R.reject(R.isNil), R.map(model.setLock$(lock)), updateElements$(elements));
      }
      function elementsAdd(news, elements) {
        var new_stamps = R.map(R.path(['state', 'stamp']), news);
        return R.thread(elements)(gameElementsModel.removeStamps$(new_stamps), R.flip(updateElements$)(news));
      }
      function elementsRemoveStamps(stamps, elements) {
        return R.thread(elements)(R.over(R.lensProp('active'), R.reject(inStamps)), R.over(R.lensProp('locked'), R.reject(inStamps)));

        function inStamps(element) {
          return R.find(R.equals(R.path(['state', 'stamp'], element)), stamps);
        }
      }
      function elementsCopyStampsP(stamps, elements) {
        return R.threadP(elements)(gameElementsModel.findAnyStampsP$(stamps), R.reject(R.isNil), makeCreate);

        function makeCreate(selection) {
          var base = R.pick(['x', 'y', 'r'], selection[0].state);

          return _defineProperty({
            base: base
          }, type + 's', R.map(R.compose(pointModel.differenceFrom$(base), model.saveState), selection));
        }
      }
      function fromStampsP(onError, method, args, stamps, elements) {
        return R.threadP()(checkIfMethodExists, R.always(elements), gameElementsModel.findAnyStampsP$(stamps), R.reject(R.isNil), R.map(callMethodOnElementP), R.promiseAll);

        function checkIfMethodExists() {
          return R.threadP(model)(R.prop(method), R.type, R.rejectIfP(R.complement(R.equals('Function')), 'Unknown method "' + method + '" on ' + type + 's'));
        }
        function callMethodOnElementP(element) {
          return self.Promise.resolve(model[method].apply(model, [].concat(_toConsumableArray(args), [element]))).catch(onError(element));
        }
      }
      function updateElements(elements, news) {
        return R.thread(elements)(gameElementsModel.all, R.concat(news), R.uniqBy(R.path(['state', 'stamp'])), R.partition(model.isLocked), function (_ref2) {
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
