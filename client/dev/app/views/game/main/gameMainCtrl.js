'use strict';

(function () {
  angular.module('clickApp.controllers').controller('gameMainCtrl', gameMainCtrl);
  gameMainCtrl.$inject = ['$scope'];
  function gameMainCtrl($scope) {
    var vm = this;
    console.log('init gameMainCtrl');

    // vm.doUseRuler = doUseRuler;
    // vm.doToggleShowRuler = doToggleShowRuler;
    // vm.doUseLos = doUseLos;
    // vm.doToggleShowLos = doToggleShowLos;
    // vm.doCreateTemplate = doCreateTemplate;

    activate();

    function activate() {}
    // $scope.game.hints.go_to_main = false;
    // $scope.digestOnStateChangeEvent('Game.ruler.remote.change', $scope);
    // $scope.digestOnStateChangeEvent('Game.los.remote.change', $scope);

    // function doUseRuler() {
    //   if($scope.currentModeIs('Ruler')) {
    //     $scope.game.doModeAction('modeBackToDefault');
    //   }
    //   else {
    //     $scope.game.doModeAction('enterRulerMode');
    //   }
    // }
    // function doToggleShowRuler() {
    //   $scope.stateEvent('Game.command.execute',
    //                     'setRuler', ['toggleDisplay', []]);
    // }

    // function doUseLos() {
    //   if($scope.currentModeIs('LoS')) {
    //     $scope.doModeAction('modeBackToDefault');
    //   }
    //   else {
    //     $scope.doModeAction('enterLosMode');
    //   }
    // }
    // function doToggleShowLos() {
    //   $scope.stateEvent('Game.command.execute',
    //                     'setLos', ['toggleDisplay', []]);
    // }

    // function doCreateTemplate(type) {
    //   $scope.stateEvent('Game.template.create', type);
    // }
  }
})();
//# sourceMappingURL=gameMainCtrl.js.map
