'use strict';

angular.module('clickApp.controllers')
  .controller('settingsModelsCtrl', [
    '$scope',
    'fileImport',
    'gameFactions',
    function($scope,
             fileImportService,
             gameFactionsService) {
      console.log('init settingsModelsCtrl');

      gameFactionsService.loadDesc()
        .then(function(desc) {
          $scope.desc = desc;
        });
      $scope.hasDesc = function hasDesc(faction) {
        return ( R.exists($scope.desc) &&
                 R.type($scope.desc[faction]) === 'Object'
               );
      };
      
      $scope.doOpenFactionFile = function(faction, files) {
        console.log('openFactionFile', faction, files);
        $scope.success = ''; 
        $scope.error = '';
        fileImportService.read('json', files[0])
          .then(function(data) {
            console.log(data);
            $scope.success = 'file loaded';
            $scope.desc[faction] = data;
            gameFactionsService.storeDesc($scope.desc);
            $scope.reloadFactions();
          })
          .catch(function(error) {
            $scope.error = 'error loading file : '+error;
          })
          .then(function() {
            $scope.deferDigest($scope);
          });
      };
      $scope.doClearFactionDesc = function(faction) {
        $scope.desc = R.omit([faction], $scope.desc);
        gameFactionsService.storeDesc($scope.desc);
        $scope.reloadFactions();
      };
      $scope.doClearAllDesc = function() {
        $scope.desc = {};
        gameFactionsService.storeDesc($scope.desc);
        $scope.reloadFactions();
      };
    }
  ]);
