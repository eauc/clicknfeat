'use strict';

angular.module('clickApp.controllers').controller('clickGameEditDamageCtrl', ['$scope', function () {
  console.log('init clickGameEditDamageCtrl');
}]);

angular.module('clickApp.directives').directive('clickGameEditDamage', ['$window', 'game', 'gameFactions', 'gameMap', function ($window, gameService, gameFactionsService, gameMapService) {
  return {
    restrict: 'A',
    template: ['<click-game-model-damage info="info.damage"', '  state="selection.state"', '  on-error="gameEvent(\'modeActionError\', reason)">', '</click-game-model-damage>'].join(''),
    scope: true,
    controller: 'clickGameEditDamageCtrl',
    link: function link(scope, element) {
      console.log('gameEditDamage');
      var viewport = document.getElementById('viewport');
      var map = document.getElementById('map');
      var state = scope.state;

      var opened = false;
      function toggleEditDamage(event, selection) {
        console.log('toggleEditDamage');
        if (opened) {
          closeEditDamage();
        } else {
          openEditDamage(event, selection);
        }
      }

      closeEditDamage();
      function closeEditDamage() {
        // console.log('closeEditDamage');

        opened = false;
        scope.selection = {};

        element[0].style.display = 'none';
        element[0].style.visibility = 'hidden';
        element[0].style.left = 0 + 'px';
        element[0].style.top = 0 + 'px';
      }
      function openEditDamage($event, selection) {
        // console.log('openEditDamage');

        opened = true;
        scope.selection = selection;
        gameFactionsService.getModelInfo(scope.selection.state.info, state.factions).then(function (info) {
          scope.info = info;
          scope.$digest();
        });

        $window.requestAnimationFrame(displayEditDamage);
      }
      function displayEditDamage() {
        element[0].style.display = 'initial';
        element[0].style.visibility = 'hidden';

        $window.requestAnimationFrame(showEditDamage);
      }
      function showEditDamage() {
        placeEditDamage();
        element[0].style.visibility = 'visible';
      }
      function placeEditDamage() {
        var detail_rect = element[0].getBoundingClientRect();
        var screen_pos = gameMapService.mapToScreenCoordinates(map, scope.selection.state);
        var viewport_rect = viewport.getBoundingClientRect();

        var max_top = viewport_rect.height - detail_rect.height;
        var max_left = viewport_rect.width - detail_rect.width;

        var top = Math.max(0, Math.min(max_top, screen_pos.y - detail_rect.height / 2));
        var left = Math.max(0, Math.min(max_left, screen_pos.x - detail_rect.width / 2));

        element[0].style.top = top + 'px';
        element[0].style.left = left + 'px';
      }

      scope.onStateChangeEvent('Game.editDamage.toggle', toggleEditDamage, scope);
      scope.onStateChangeEvent('Game.editDamage.open', openEditDamage, scope);
      scope.onStateChangeEvent('Game.editDamage.close', closeEditDamage, scope);
      scope.doClose = closeEditDamage;
    }
  };
}]);
//# sourceMappingURL=editDamage.js.map
