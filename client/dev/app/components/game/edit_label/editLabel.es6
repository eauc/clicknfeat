(function() {
  angular.module('clickApp.directives')
    .controller('clickGameEditLabelCtrl', gameEditLabelCtrl)
    .directive('clickGameEditLabel', gameEditLabelDirectiveFactory);

  gameEditLabelCtrl.$inject = [
    '$scope',
  ];
  function gameEditLabelCtrl($scope) {
    const vm = this;
    console.log('init clickGameEditLabelCtrl');

    vm.new_label = '';
    vm.doAddLabel = doAddLabel;

    function doAddLabel() {
      const new_label = s.trim(vm.new_label);
      if(R.length(new_label) === 0) return;

      $scope
        .stateEvent('Game.command.execute',
                    'onModels', [
                      'addLabel',
                      [new_label],
                      [vm.selection.state.stamp]
                    ])
        .then(() => {
          vm.new_label = '';
          vm.doClose();
          $scope.$digest();
        });
    }
  }

  gameEditLabelDirectiveFactory.$inject = [
    'gameMap',
  ];
  function gameEditLabelDirectiveFactory(gameMapService) {
    return {
      restrict: 'A',
      templateUrl: 'app/components/game/edit_label/edit_label.html',
      scope: true,
      controller: 'clickGameEditLabelCtrl',
      controllerAs: 'edit_label',
      link: link
    };

    function link(scope, element) {
      console.log('gameEditLabel');
      const map = document.getElementById('map');
      const container = element[0];
      const input = container.querySelector('input');

      closeEditLabel();
      scope.onStateChangeEvent('Game.editLabel.open', openEditLabel, scope);
      scope.onStateChangeEvent('Game.editLabel.close', closeEditLabel, scope);
      input.addEventListener('keydown', closeOnEscape);
      scope.edit_label.doRefresh = refreshEditLabel;
      scope.edit_label.doClose = closeEditLabel;

      function closeOnEscape(event) {
        if(event.keyCode === 27) { // ESC
          closeEditLabel();
        }
      }
      function closeEditLabel() {
        // console.log('closeEditLabel');
        scope.edit_label.selection = {};

        container.style.display = 'none';
        container.style.visibility = 'hidden';
        container.style.left = 0+'px';
        container.style.top = 0+'px';
      }
      function openEditLabel(_event_, selection) {
        // console.log('openEditLabel');
        scope.edit_label.selection = selection;
        scope.edit_label.new_label = '';
        scope.$digest();

        self.window.requestAnimationFrame(displayEditLabel);
      }
      function displayEditLabel() {
        container.style.display = 'initial';
        container.style.visibility = 'hidden';
        setEditLabelWidth();

        self.window.requestAnimationFrame(showEditLabel);
      }
      function showEditLabel() {
        placeEditLabel();
        container.style.visibility = 'visible';

        self.window.requestAnimationFrame(() => {
          input.focus();
        });
      }
      function refreshEditLabel() {
        setEditLabelWidth();

        self.window.requestAnimationFrame(placeEditLabel);
      }
      function placeEditLabel() {
        const detail_rect = input.getBoundingClientRect();
        const screen_pos = gameMapService
                .mapToScreenCoordinates(map, scope.edit_label.selection.state);

        container.style.left = (screen_pos.x - detail_rect.width / 2) + 'px';
        container.style.top = (screen_pos.y - detail_rect.height / 2) + 'px';
      }
      function setEditLabelWidth() {
        input.style.width = R.length(scope.edit_label.new_label) + 'em';
      }
    }
  }
})();
