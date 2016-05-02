(function() {
  angular.module('clickApp.directives')
    .directive('clickGameLos', gameLosDirectiveFactory)
    .directive('clickGameLosEnveloppe', gameLosEnveloppeDirectiveFactory);

  gameLosDirectiveFactory.$inject = [
    'modes',
    'gameLos',
    'gameModels',
    'gameFactions',
  ];
  function gameLosDirectiveFactory(modesModel,
                                   gameLosModel) {
    return {
      restrict: 'A',
      scope: true,
      link: link
    };

    function link(scope) {
      // const map = document.getElementById('map');
      scope.onStateChangeEvent('Game.los.local.change', updateLos, scope);
      scope.onStateChangeEvent('Game.los.remote.change', updateLos, scope);

      function updateLos() {
        const state = scope.state;
        const los = state.game.los;
        const in_los_mode = modesModel
                .currentModeName(state.modes) === 'Los';
        scope.render = gameLosModel
          .render({ in_los_mode,
                    factions: state.factions,
                    models: state.game.models }, los);
        scope.$digest();
      }
    }
  }

  gameLosEnveloppeDirectiveFactory.$inject = [
    'gameLos'
  ];
  function gameLosEnveloppeDirectiveFactory(gameLosModel) {
    return {
      restrict: 'A',
      scope: true,
      link: link
    };
    function link(scope) {
      scope.onStateChangeEvent('Game.los.remote.change', updateEnvelope, scope);
      function updateEnvelope() {
        const state = scope.state;
        const los = state.game.los;
        scope.render = gameLosModel.renderEnveloppe(state, los);
        const clip_path = document.querySelector('#los-clip polygon');
        clip_path.setAttribute('points', scope.render.enveloppe);
        scope.$digest();
      }
    }
  }
})();
