'use strict';

(function () {
  angular.module('clickApp.directives').controller('gameToolBoxCtrl', toolBoxCtrl).directive('clickGameToolBox', gameToolBoxDirectiveFactory);

  toolBoxCtrl.$inject = ['$scope'];
  function toolBoxCtrl($scope) {
    var vm = this;
    console.log('gameToolBoxCtrl');

    // vm.doUseRuler = doUseRuler;
    // vm.doToggleShowRuler = doToggleShowRuler;
    // vm.doUseLos = doUseLos;
    // vm.doToggleShowLos = doToggleShowLos;
    vm.doCreateTemplate = doCreateTemplate;

    activate();

    function activate() {}
    // $scope.digestOnStateChangeEvent('Game.ruler.remote.change', $scope);
    // $scope.digestOnStateChangeEvent('Game.los.remote.change', $scope);

    // function doUseRuler() {
    //   if($scope.game.currentModeIs('Ruler')) {
    //     $scope.game.doModeAction('modeBackToDefault');
    //   }
    //   else {
    //     $scope.game.doModeAction('enterRulerMode');
    //   }
    // }
    // function doToggleShowRuler() {
    //   $scope.stateEvent('Game.command.execute',
    //                     'setRuler', [
    //                       'toggleDisplay',
    //                       []
    //                     ]);
    // }

    // function doUseLos() {
    //   if($scope.game.currentModeIs('Los')) {
    //     $scope.game.doModeAction('modeBackToDefault');
    //   }
    //   else {
    //     $scope.game.doModeAction('enterLosMode');
    //   }
    // }
    // function doToggleShowLos() {
    //   $scope.stateEvent('Game.command.execute',
    //                     'setLos', [
    //                       'toggleDisplay',
    //                       []
    //                     ]);
    // }

    function doCreateTemplate(type) {
      $scope.stateEvent('Game.template.create', type);
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
      link: function link() {}
    };
  }
})();
//# sourceMappingURL=gameToolBox.js.map
