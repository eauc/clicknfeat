'use strict';

angular.module('clickApp.directives')
  .directive('clickGameLayers', [
    'gameLayers',
    function(gameLayersService) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var board = element[0].querySelector('#game-board');
          var deploiement = element[0].querySelector('#game-deploiement');
          var scenario = element[0].querySelector('#game-scenario');
          var templates_locked = element[0].querySelector('#game-templates-locked');
          var templates = element[0].querySelector('#game-templates');
          var under_models = element[0].querySelector('#game-under-models');
          var models = element[0].querySelector('#game-models');
          var over_models = element[0].querySelector('#game-over-models');

          scope.onGameEvent('changeLayers', function onChangeLayers() {
            self.requestAnimationFrame(function _onChangeLayers() {
              board.style.display =
                ( gameLayersService.isDisplayed('b', scope.game.layers) ?
                  'initial' : 'none'
                );
              deploiement.style.display =
                ( gameLayersService.isDisplayed('d', scope.game.layers) ?
                  'initial' : 'none'
                );
              scenario.style.display =
                ( gameLayersService.isDisplayed('s', scope.game.layers) ?
                  'initial' : 'none'
                );
              templates.style.display =
                ( gameLayersService.isDisplayed('t', scope.game.layers) ?
                  'initial' : 'none'
                );
              templates_locked.style.display =
                ( gameLayersService.isDisplayed('t', scope.game.layers) ?
                  'initial' : 'none'
                );
              models.style.display =
                ( gameLayersService.isDisplayed('m', scope.game.layers) ?
                  'initial' : 'none'
                );
              under_models.style.display =
                ( gameLayersService.isDisplayed('m', scope.game.layers) ?
                  'initial' : 'none'
                );
              over_models.style.display =
                ( gameLayersService.isDisplayed('m', scope.game.layers) ?
                  'initial' : 'none'
                );
            });
          }, scope);
        }
      };
    }
  ]);
