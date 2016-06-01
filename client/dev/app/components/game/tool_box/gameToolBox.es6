(function() {
  angular.module('clickApp.directives')
    .controller('gameToolBoxCtrl', toolBoxCtrl)
    .directive('clickGameToolBox', gameToolBoxDirectiveFactory);

  toolBoxCtrl.$inject = [
    '$scope',
  ];
  function toolBoxCtrl($scope) {
    const vm = this;
    console.log('gameToolBoxCtrl');

    vm.doUseRuler = doUseRuler;
    vm.doToggleShowRuler = doToggleShowRuler;
    vm.doUseLos = doUseLos;
    vm.doToggleShowLos = doToggleShowLos;
    vm.doCreateTemplate = doCreateTemplate;

    function doUseRuler() {
      if($scope.game.currentModeIs('Ruler')) {
        $scope.game.doModeAction('modeBackToDefault');
      }
      else {
        $scope.game.doModeAction('enterRulerMode');
      }
    }
    function doToggleShowRuler() {
      $scope.sendAction('Game.command.execute',
                        'setRuler', [
                          'toggleDisplay',
                          []
                        ]);
    }

    function doUseLos() {
      if($scope.game.currentModeIs('Los')) {
        $scope.game.doModeAction('modeBackToDefault');
      }
      else {
        $scope.game.doModeAction('enterLosMode');
      }
    }
    function doToggleShowLos() {
      $scope.sendAction('Game.command.execute',
                        'setLos', [
                          'toggleDisplay',
                          []
                        ]);
    }

    function doCreateTemplate(type) {
      $scope.sendAction('Game.template.create', type);
    }
  }

  gameToolBoxDirectiveFactory.$inject = [];
  function gameToolBoxDirectiveFactory() {
    return {
      restrict: 'E',
      controller: 'gameToolBoxCtrl',
      controllerAs: 'tool_box',
      templateUrl: 'app/components/game/tool_box/game_tool_box.html',
      scope: true,
      link: () => {}
    };
  }
})();
