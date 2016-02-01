angular.module('clickApp.controllers')
  .controller('settingsBindingsCtrl', [
    '$scope',
    function($scope) {
      console.log('init settingsBindingsCtrl');

      $scope.getBindingsKeys = (mode) => {
        return R.keys($scope.state.settings.default['Bindings'][mode]).sort();
      };
      function updateModes() {
        $scope.modes = R.keys($scope.state.settings.default['Bindings']).sort();
        $scope.mode = R.defaultTo(R.head($scope.modes), $scope.mode);
      }
      $scope.state.data_ready.then(updateModes);

      $scope.doRecordBinding = (action) => {
        if($scope.recording) return;
        $scope.recording = action;

        R.pipeP(
          () => {
            return new self.Promise((resolve) => {
              Mousetrap.record((seq) => {
                console.log('Mousetrap seq recorded', seq);
                resolve(seq);
              });
            });
          },
          (seq) => {
            if(R.isNil(seq) || R.isEmpty(seq)) {
              return;
            }
            $scope.edit_settings.Bindings[$scope.mode][action] = seq.join(' ');
          },
          () => {
            $scope.recording = null;
            $scope.$digest();
          }
        )();
      };

      $scope.$on('$destroy', $scope.doUpdateSettings);
    }
  ]);
