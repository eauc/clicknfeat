'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.directives').directive('clickGameRuler', gameRulerDirectiveFactory);

  gameRulerDirectiveFactory.$inject = ['appGame', 'gameRuler', 'gameModels', 'modes'];
  function gameRulerDirectiveFactory(appGameService, gameRulerModel, gameModelsModel, modesModel) {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'app/components/game/ruler/ruler.html',
      link: link
    };
    function link(scope) {
      scope.listenSignal(updateRuler, appGameService.ruler.changes, scope);

      function updateRuler(_ref) {
        var _ref2 = _slicedToArray(_ref, 4);

        var modes = _ref2[0];
        var models = _ref2[1];
        var flipped = _ref2[2];
        var ruler = _ref2[3];

        var label_center = {
          x: (ruler.remote.end.x - ruler.remote.start.x) / 2 + ruler.remote.start.x,
          y: (ruler.remote.end.y - ruler.remote.start.y) / 2 + ruler.remote.start.y
        };
        scope.render = {
          local: { show: ruler.local.display,
            x1: ruler.local.start.x,
            y1: ruler.local.start.y,
            x2: ruler.local.end.x,
            y2: ruler.local.end.y
          },
          remote: { show: ruler.remote.display,
            x1: ruler.remote.start.x,
            y1: ruler.remote.start.y,
            x2: ruler.remote.end.x,
            y2: ruler.remote.end.y
          },
          label: renderText({ flipped: flipped,
            flip_center: label_center,
            text_center: label_center
          }, ruler.remote.length)
        };
        scope.render.label.show = ruler.remote.display;
        var in_ruler_mode = modesModel.currentModeName(modes) === 'Ruler';
        scope.render.origin = updateOrigin(models, in_ruler_mode, ruler.remote);
        scope.render.target = updateTarget(models, in_ruler_mode, ruler.remote);
        scope.$digest();
        console.warn('RENDER RULER', arguments, scope.render);
      }
    }
    function renderText(_ref3, text) {
      var _ref3$rotate = _ref3.rotate;
      var rotate = _ref3$rotate === undefined ? 0 : _ref3$rotate;
      var _ref3$flipped = _ref3.flipped;
      var flipped = _ref3$flipped === undefined ? false : _ref3$flipped;
      var _ref3$flip_center = _ref3.flip_center;
      var flip_center = _ref3$flip_center === undefined ? { x: 240, y: 240 } : _ref3$flip_center;
      var _ref3$text_center = _ref3.text_center;
      var text_center = _ref3$text_center === undefined ? { x: 240, y: 240 } : _ref3$text_center;

      text += '';
      rotate += flipped ? 180 : 0;
      var transform = 'rotate(' + rotate + ',' + flip_center.x + ',' + flip_center.y + ')';
      var x = text_center.x;
      var y = text_center.y;
      var bkg_width = R.length(text) * 5;
      var bkg_x = text_center.x - bkg_width / 2;
      var bkg_y = text_center.y - 5;
      return {
        text: text,
        x: x, y: y, transform: transform,
        bkg_x: bkg_x, bkg_y: bkg_y, bkg_width: bkg_width
      };
    }
    function updateOrigin(models, in_ruler_mode, remote) {
      if (R.isNil(remote.origin) || !remote.display && !in_ruler_mode) return null;

      var origin_model = gameModelsModel.findStamp(remote.origin, models);
      if (R.isNil(origin_model)) return null;

      var origin_info = origin_model.info;
      return {
        cx: origin_model.state.x,
        cy: origin_model.state.y,
        radius: origin_info.base_radius
      };
    }
    function updateTarget(models, in_ruler_mode, remote) {
      if (R.isNil(remote.target) || !remote.display && !in_ruler_mode) return null;

      var target_model = gameModelsModel.findStamp(remote.target, models);
      if (R.isNil(target_model)) return null;

      var target_info = target_model.info;
      var reached = gameRulerModel.targetReached({ remote: remote });
      return {
        cx: target_model.state.x,
        cy: target_model.state.y,
        radius: target_info.base_radius,
        reached: reached
      };
    }
  }
})();
//# sourceMappingURL=gameRuler.js.map
