angular.module('clickApp.controllers')
  .controller('gameMainCtrl', [
    '$scope',
    function($scope) {
      console.log('init gameMainCtrl');

      $scope.hints.go_to_main = false;

      $scope.doUseRuler = () => {
        if($scope.currentModeIs('Ruler')) {
          $scope.doModeAction('modeBackToDefault');
        }
        else {
          $scope.doModeAction('enterRulerMode');
        }
      };
      $scope.doToggleShowRuler = () => {
        $scope.stateEvent('Game.command.execute',
                          'setRuler', ['toggleDisplay', []]);
      };
      $scope.digestOnStateChangeEvent('Game.ruler.remote.change', $scope);

      $scope.doUseLos = () => {
        if($scope.currentModeIs('LoS')) {
          $scope.doModeAction('modeBackToDefault');
        }
        else {
          $scope.doModeAction('enterLosMode');
        }
      };
      $scope.doToggleShowLos = () => {
        $scope.stateEvent('Game.command.execute',
                          'setLos', ['toggleDisplay', []]);
      };
      $scope.digestOnStateChangeEvent('Game.los.remote.change', $scope);

      $scope.doCreateTemplate = (type) => {
        $scope.stateEvent('Game.template.create', type);
      };
    }
  ]);
