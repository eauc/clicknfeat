'use strict';

(function () {
  angular.module('clickApp.controllers').controller('gameMainCtrl', gameMainCtrl);
  gameMainCtrl.$inject = ['$scope'];
  function gameMainCtrl($scope) {
    var vm = this;
    console.log('init gameMainCtrl');

    vm.doUseRuler = doUseRuler;
    vm.doToggleShowRuler = doToggleShowRuler;
    vm.doUseLos = doUseLos;
    vm.doToggleShowLos = doToggleShowLos;
    vm.doCreateTemplate = doCreateTemplate;

    activate();

    function activate() {
      $scope.digestOnStateChangeEvent('Game.ruler.remote.change', $scope);
      $scope.digestOnStateChangeEvent('Game.los.remote.change', $scope);
    }

    function doUseRuler() {
      if ($scope.game.currentModeIs('Ruler')) {
        $scope.game.doModeAction('modeBackToDefault');
      } else {
        $scope.game.doModeAction('enterRulerMode');
      }
    }
    function doToggleShowRuler() {
      $scope.stateEvent('Game.command.execute', 'setRuler', ['toggleDisplay', []]);
    }

    function doUseLos() {
      if ($scope.game.currentModeIs('Los')) {
        $scope.game.doModeAction('modeBackToDefault');
      } else {
        $scope.game.doModeAction('enterLosMode');
      }
    }
    function doToggleShowLos() {
      $scope.stateEvent('Game.command.execute', 'setLos', ['toggleDisplay', []]);
    }

    function doCreateTemplate(type) {
      $scope.stateEvent('Game.template.create', type);
    }
  }
})();
//# sourceMappingURL=gameMainCtrl.js.map
