'use strict';

angular.module('clickApp.controllers')
  .controller('debugCtrl', [
    '$scope',
    'games',
    'fileImport',
    function($scope,
             gamesService,
             fileImportService) {
      console.log('init loungeCtrl');
      $scope.checkUser();

      gamesService.loadLocalGames()
        .then(function(local_games) {
          $scope.local_games = local_games;
        });

      $scope.doOpenDumpFile = function doOpenDumpFile(files) {
        fileImportService.read('json', files[0])
          .then(function(data) {
            $scope.doResetSettings(data.settings);
            $scope.local_games = gamesService.newLocalGame(data.game, $scope.local_games);
            $scope.goToState('game', { where: 'offline', id: R.length($scope.local_games)-1 });
          })
          .catch(function() {
            console.log('Failed to open dump file');
          });
      };
    }
  ]);
