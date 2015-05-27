'use strict';

angular.module('clickApp.controllers')
  .controller('settingsBindingsCtrl', [
    '$scope',
    function($scope) {
      console.log('init settingsBindingsCtrl');
      $scope.modes = R.keys($scope.settings.default['Bindings']);
      $scope.mode = R.head($scope.modes);
      $scope.doRecordBinding = function doRecordBinding(action) {
        if($scope.recording) return;
        console.log('recording seq');
        $scope.recording = action;
        Mousetrap.record(function mousetrapRecord(seq) {
          console.log('seq recorded', seq);
          $scope.settings.current.Bindings[$scope.mode][action] = seq.join(' ');
          $scope.doUpdateSettings();
          $scope.recording = null;
          $scope.deferDigest($scope);
        });
      };
    }
  ]);
