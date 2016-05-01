'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameRuler', gameRulerDirectiveFactory);

  gameRulerDirectiveFactory.$inject = ['gameMap', 'gameRuler', 'gameModels', 'gameFactions', 'modes'];
  function gameRulerDirectiveFactory(gameMapModel, gameRulerModel, gameModelsModel, gameFactionsModel, modesModel) {
    return {
      restrict: 'A',
      scope: true,
      link: link
    };
    function link(scope) {
      scope.onStateChangeEvent('Game.ruler.local.change', updateRuler, scope);
      scope.onStateChangeEvent('Game.ruler.remote.change', updateRuler, scope);
      scope.onStateChangeEvent('Game.map.flipped', updateRuler, scope);

      function updateRuler() {
        var map = document.getElementById('map');
        var map_flipped = gameMapModel.isFlipped(map);
        var state = scope.state;
        var ruler = state.game.ruler;
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
          label: renderText({ flipped: map_flipped,
            flip_center: label_center,
            text_center: label_center
          }, ruler.remote.length)
        };
        scope.render.label.show = ruler.remote.display;
        var in_ruler_mode = modesModel.currentModeName(state.modes) === 'Ruler';
        scope.render.origin = updateOrigin(state.factions, state.game.models, in_ruler_mode, ruler.remote);
        scope.render.target = updateTarget(state.factions, state.game.models, in_ruler_mode, ruler.remote);
        scope.$digest();
      }
    }
    function renderText(_ref, text) {
      var _ref$rotate = _ref.rotate;
      var rotate = _ref$rotate === undefined ? 0 : _ref$rotate;
      var _ref$flipped = _ref.flipped;
      var flipped = _ref$flipped === undefined ? false : _ref$flipped;
      var _ref$flip_center = _ref.flip_center;
      var flip_center = _ref$flip_center === undefined ? { x: 240, y: 240 } : _ref$flip_center;
      var _ref$text_center = _ref.text_center;
      var text_center = _ref$text_center === undefined ? { x: 240, y: 240 } : _ref$text_center;

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
    function updateOrigin(factions, models, in_ruler_mode, remote) {
      if (R.isNil(remote.origin) || !remote.display && !in_ruler_mode) return null;

      var origin_model = gameModelsModel.findStamp(remote.origin, models);
      if (R.isNil(origin_model)) return null;

      var origin_info = gameFactionsModel.getModelInfo(origin_model.state.info, factions);
      if (R.isNil(origin_info)) return null;

      return {
        cx: origin_model.state.x,
        cy: origin_model.state.y,
        radius: origin_info.base_radius
      };
    }
    function updateTarget(factions, models, in_ruler_mode, remote) {
      if (R.isNil(remote.target) || !remote.display && !in_ruler_mode) return null;

      var target_model = gameModelsModel.findStamp(remote.target, models);
      if (R.isNil(target_model)) return null;

      var target_info = gameFactionsModel.getModelInfo(target_model.state.info, factions);
      if (R.isNil(target_info)) return null;

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
