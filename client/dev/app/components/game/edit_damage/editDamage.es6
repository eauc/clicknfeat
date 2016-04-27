(function() {
  angular.module('clickApp.directives')
    .controller('clickGameEditDamageCtrl', gameEditDamageCtrl)
    .directive('clickGameEditDamage', gameEditDamageDirectiveFactory);

  gameEditDamageCtrl.$inject = [
    '$scope',
  ];
  function gameEditDamageCtrl() {
    console.log('init clickGameEditDamageCtrl');
  }

  gameEditDamageDirectiveFactory.$inject = [
    'gameFactions',
    'gameMap',
  ];
  function gameEditDamageDirectiveFactory(gameFactionsModel,
                                          gameMapService) {
    return {
      restrict: 'A',
      templateUrl: 'app/components/game/edit_damage/edit_damage.html',
      scope: true,
      controller: 'clickGameEditDamageCtrl',
      controllerAs: 'edit_damage',
      link: link
    };

    function link(scope, element) {
      console.log('gameEditDamage');
      const viewport = document.getElementById('viewport');
      const map = document.getElementById('map');
      const state = scope.state;
      const container = element[0];

      let opened = false;
      closeEditDamage();
      scope.onStateChangeEvent('Game.editDamage.toggle', toggleEditDamage, scope);
      scope.onStateChangeEvent('Game.editDamage.open', openEditDamage, scope);
      scope.onStateChangeEvent('Game.editDamage.close', closeEditDamage, scope);
      scope.doClose = closeEditDamage;

      function toggleEditDamage(event, selection) {
        console.log('toggleEditDamage');
        if(opened) {
          closeEditDamage();
        }
        else {
          openEditDamage(event, selection);
        }
      }
      function closeEditDamage() {
        // console.log('closeEditDamage');
        opened = false;
        scope.selection = {};

        container.style.display = 'none';
        container.style.visibility = 'hidden';
        container.style.left = 0+'px';
        container.style.top = 0+'px';
      }
      function openEditDamage(_event_, [selection]) {
        // console.log('openEditDamage');
        opened = true;
        scope.selection = selection;
        const info = gameFactionsModel
                .getModelInfo(scope.selection.state.info, state.factions);
        scope.info = info;
        scope.$digest();

        self.window.requestAnimationFrame(displayEditDamage);
      }
      function displayEditDamage() {
        container.style.display = 'initial';
        container.style.visibility = 'hidden';

        self.window.requestAnimationFrame(showEditDamage);
      }
      function showEditDamage() {
        placeEditDamage();
        container.style.visibility = 'visible';
      }
      function placeEditDamage() {
        const detail_rect = container.getBoundingClientRect();
        const screen_pos = gameMapService
                .mapToScreenCoordinates(map, scope.selection.state);
        const viewport_rect = viewport.getBoundingClientRect();

        const max_top = viewport_rect.height - detail_rect.height;
        const max_left = viewport_rect.width - detail_rect.width;

        const top = Math.max(0,
                             Math.min(max_top,
                                      screen_pos.y - detail_rect.height / 2
                                     )
                            );
        const left = Math.max(0,
                              Math.min(max_left,
                                       screen_pos.x - detail_rect.width / 2
                                      )
                             );

        container.style.top = top + 'px';
        container.style.left = left + 'px';
      }
    }
  }
})();
