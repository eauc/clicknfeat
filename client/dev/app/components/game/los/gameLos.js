'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.directives').directive('clickGameLos', gameLosDirectiveFactory).directive('clickGameLosEnveloppe', gameLosEnveloppeDirectiveFactory);

  gameLosDirectiveFactory.$inject = ['appGame', 'appModes', 'modes', 'gameLos'];
  function gameLosDirectiveFactory(appGameService, appModesService, modesModel, gameLosModel) {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'app/components/game/los/los.html',
      link: link
    };

    function link(scope) {
      scope.listenSignal(updateLos, appGameService.los.changes, scope);

      mount();

      function mount() {
        var modes = appModesService.modes.sample();
        var models = appGameService.models.models.sample();
        var los = appGameService.los.los.sample();

        updateLos([modes, models, los]);
      }
      function updateLos(_ref) {
        var _ref2 = _slicedToArray(_ref, 3);

        var modes = _ref2[0];
        var models = _ref2[1];
        var los = _ref2[2];

        var in_los_mode = modesModel.currentModeName(modes) === 'Los';
        scope.render = gameLosModel.render({ in_los_mode: in_los_mode,
          models: models }, los);
        console.warn('RENDER LOS', arguments, scope.render);
      }
    }
  }

  gameLosEnveloppeDirectiveFactory.$inject = ['appGame', 'gameLos'];
  function gameLosEnveloppeDirectiveFactory(appGameService, gameLosModel) {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'app/components/game/los/los_enveloppe.html',
      link: link
    };
    function link(scope) {
      scope.listenSignal(updateEnvelope, appGameService.los.changes, scope);
      function updateEnvelope(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 3);

        var _modes_ = _ref4[0];
        var models = _ref4[1];
        var los = _ref4[2];

        scope.render = gameLosModel.renderEnveloppe(models, los);
        var clip_path = document.querySelector('#los-clip polygon');
        clip_path.setAttribute('points', scope.render.enveloppe);
        console.warn('RENDER LOS ENVELOPPE', arguments, scope.render);
      }
    }
  }
})();
//# sourceMappingURL=gameLos.js.map
