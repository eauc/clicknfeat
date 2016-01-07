'use strict';

angular.module('clickApp.controllers')
  .controller('settingsModelsCtrl', [
    '$scope',
    function($scope) {
      console.log('init settingsModelsCtrl');

      $scope.hasDesc = (faction) => {
        return R.type(R.path(['state','factions','desc',faction], $scope)) === 'Object';
      };
      // $scope.state.data_ready.then(() => { $scope.$digest(); });
      $scope.digestOnStateChangeEvent('Factions.change', $scope);
      $scope.onStateChangeEvent('Factions.loadDescFile', (event, result) => {
        $scope.result = result;
        $scope.$digest();
      }, $scope);
      
      $scope.doOpenFactionFile = function(faction, files) {
        $scope.stateEvent('Factions.loadDescFile', faction, files[0]);
      };
      $scope.doClearFactionDesc = function(faction) {
        $scope.stateEvent('Factions.clearDesc', faction);
      };
      $scope.doClearAllDesc = function() {
        $scope.stateEvent('Factions.clearAllDesc');
      };
    }
  ]);
