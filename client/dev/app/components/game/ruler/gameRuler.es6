(function() {
  angular.module('clickApp.directives')
    .directive('clickGameRuler', gameRulerDirectiveFactory);

  gameRulerDirectiveFactory.$inject = [
    'appGame',
    'appModes',
    'gameRuler',
    'gameModels',
    'modes',
  ];
  function gameRulerDirectiveFactory(appGameService,
                                     appModesService,
                                     gameRulerModel,
                                     gameModelsModel,
                                     modesModel) {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'app/components/game/ruler/ruler.html',
      link: link
    };
    function link(scope) {
      scope.listenSignal(updateRuler, appGameService.ruler.changes, scope);

      mount();

      function mount() {
        const modes = appModesService.modes.sample();
        const models = appGameService.models.models.sample();
        const ruler = appGameService.ruler.ruler.sample();

        updateRuler([modes, models, false, ruler]);
      }
      function updateRuler([modes, models, flipped, ruler]) {
        const label_center = {
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
          label: renderText({ flipped,
                              flip_center: label_center,
                              text_center: label_center
                            }, ruler.remote.length)
        };
        scope.render.label.show = ruler.remote.display;
        const in_ruler_mode = modesModel.currentModeName(modes) === 'Ruler';
        scope.render.origin =
          updateOrigin(models, in_ruler_mode, ruler.remote);
        scope.render.target =
          updateTarget(models, in_ruler_mode, ruler.remote);
        console.warn('RENDER RULER', arguments, scope.render);
      }
    }
    function renderText({ rotate = 0,
                          flipped = false,
                          flip_center = { x: 240, y: 240 },
                          text_center = { x: 240, y: 240 },
                        }, text) {
      text += '';
      rotate += (flipped ? 180 : 0);
      const transform = `rotate(${rotate},${flip_center.x},${flip_center.y})`;
      const x = text_center.x;
      const y = text_center.y;
      const bkg_width = R.length(text) * 5;
      const bkg_x = text_center.x - bkg_width / 2;
      const bkg_y = text_center.y - 5;
      return {
        text,
        x, y, transform,
        bkg_x, bkg_y, bkg_width
      };
    }
    function updateOrigin(models, in_ruler_mode, remote) {
      if(R.isNil(remote.origin) ||
         (!remote.display && !in_ruler_mode)) return null;

      const origin_model = gameModelsModel
              .findStamp(remote.origin, models);
      if(R.isNil(origin_model)) return null;

      const origin_info = origin_model.info;
      return {
        cx: origin_model.state.x,
        cy: origin_model.state.y,
        radius: origin_info.base_radius
      };
    }
    function updateTarget(models, in_ruler_mode, remote) {
      if(R.isNil(remote.target) ||
         (!remote.display && !in_ruler_mode)) return null;

      const target_model = gameModelsModel
              .findStamp(remote.target, models);
      if(R.isNil(target_model)) return null;

      const target_info = target_model.info;
      const reached = gameRulerModel.targetReached({ remote });
      return {
        cx: target_model.state.x,
        cy: target_model.state.y,
        radius: target_info.base_radius,
        reached
      };
    }
  }
})();
