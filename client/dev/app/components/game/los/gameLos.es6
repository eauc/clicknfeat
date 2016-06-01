(function() {
  angular.module('clickApp.directives')
    .directive('clickGameLos', gameLosDirectiveFactory)
    .directive('clickGameLosEnveloppe', gameLosEnveloppeDirectiveFactory);

  gameLosDirectiveFactory.$inject = [
    'appGame',
    'appModes',
    'modes',
    'gameLos',
  ];
  function gameLosDirectiveFactory(appGameService,
                                   appModesService,
                                   modesModel,
                                   gameLosModel) {
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
        const modes = appModesService.modes.sample();
        const models = appGameService.models.models.sample();
        const los = appGameService.los.los.sample();

        updateLos([modes, models, los]);
      }
      function updateLos([modes, models, los]) {
        const in_los_mode = modesModel
                .currentModeName(modes) === 'Los';
        scope.render = gameLosModel
          .render({ in_los_mode,
                    models: models }, los);
        console.warn('RENDER LOS', arguments, scope.render);
      }
    }
  }

  gameLosEnveloppeDirectiveFactory.$inject = [
    'appGame',
    'gameLos'
  ];
  function gameLosEnveloppeDirectiveFactory(appGameService,
                                            gameLosModel) {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'app/components/game/los/los_enveloppe.html',
      link: link
    };
    function link(scope) {
      scope.listenSignal(updateEnvelope, appGameService.los.changes, scope);
      function updateEnvelope([_modes_, models, los]) {
        scope.render = gameLosModel.renderEnveloppe(models, los);
        const clip_path = document.querySelector('#los-clip polygon');
        clip_path.setAttribute('points', scope.render.enveloppe);
        console.warn('RENDER LOS ENVELOPPE', arguments, scope.render);
      }
    }
  }
})();
