(function() {
  angular.module('clickApp.controllers')
    .controller('settingsCtrl', settingsCtrl);

  settingsCtrl.$inject = [
    '$scope',
  ];
  function settingsCtrl($scope) {
    const vm = this;
    console.log('init settingsCtrl');

    vm.doUpdateSettings = doUpdateSettings;

    activate();

    function activate() {
      $scope.state.data_ready.then(updateEditSettings);
      $scope.onStateChangeEvent('Settings.current.change',
                                updateEditSettings, $scope);
    }
    function updateEditSettings() {
      vm.edit = R.thread($scope.state)(
        R.path(['settings','current']),
        JSON.stringify,
        JSON.parse
      );
      vm.menu = R.thread($scope.state)(
        R.path(['settings','default']),
        R.keys,
        R.concat(['Main', 'Models'])
      );
      $scope.$digest();
    }

    function doUpdateSettings() {
      $scope.stateEvent('Settings.reset', vm.edit);
    }
  }
})();
