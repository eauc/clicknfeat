'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('modelEffect', modelEffectServiceFactory);

  modelEffectServiceFactory.$inject = [];
  function modelEffectServiceFactory() {
    var EFFECTS = [['b', '/data/icons/Blind.png'], ['c', '/data/icons/Corrosion.png'], ['d', '/data/icons/BoltBlue.png'], ['f', '/data/icons/Fire.png'], ['e', '/data/icons/BoltYellow.png'], ['k', '/data/icons/KD.png'], ['t', '/data/icons/Stationary.png']];
    var EFFECT_LENS = R.lensPath(['state', 'eff']);
    return function (modelService) {
      var modelEffectModel = {
        isEffectDisplayed: modelIsEffectDisplayed,
        setEffectDisplay: modelSetEffectDisplay,
        toggleEffectDisplay: modelToggleEffectDisplay,
        renderEffect: modelRenderEffect
      };
      return modelEffectModel;

      function modelIsEffectDisplayed(effect, model) {
        return !!R.find(R.equals(effect), R.viewOr([], EFFECT_LENS, model));
      }
      function modelSetEffectDisplay(effect, set, model) {
        var update = set ? R.compose(R.uniq, R.append(effect), R.defaultTo([])) : R.compose(R.reject(R.equals(effect)), R.defaultTo([]));
        return R.over(EFFECT_LENS, update, model);
      }
      function modelToggleEffectDisplay(effect, model) {
        var update = modelService.isEffectDisplayed(effect, model) ? R.compose(R.reject(R.equals(effect)), R.defaultTo([])) : R.compose(R.append(effect), R.defaultTo([]));
        return R.over(EFFECT_LENS, update, model);
      }
      function modelRenderEffect(_ref, state) {
        var img = _ref.img;
        var info = _ref.info;

        var effects = R.thread(EFFECTS)(R.filter(function (_ref2) {
          var _ref3 = _slicedToArray(_ref2, 1);

          var key = _ref3[0];
          return modelEffectModel.isEffectDisplayed(key, { state: state });
        }), function (actives) {
          var base_x = img.width / 2 - R.length(actives) * 10 / 2;
          var base_y = img.height / 2 + info.base_radius + 1;
          return R.addIndex(R.reduce)(function (mem, _ref4, i) {
            var _ref5 = _slicedToArray(_ref4, 2);

            var key = _ref5[0];
            var link = _ref5[1];

            return R.assoc(key, {
              show: modelEffectModel.isEffectDisplayed(key, { state: state }),
              x: base_x + i * 10, y: base_y, link: link
            }, mem);
          }, {}, actives);
        });
        return { effects: effects };
      }
    };
  }
})();
//# sourceMappingURL=effect.js.map
