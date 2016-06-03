'use strict';

(function () {
  angular.module('clickApp.controllers').controller('settingsMiscCtrl', settingsMiscCtrl);

  settingsMiscCtrl.$inject = ['$scope'];
  function settingsMiscCtrl($scope) {
    var vm = this;
    console.log('init settingsMiscCtrl');

    activate();

    function activate() {
      updateModes();
      $scope.$on('$destroy', $scope.settings.doUpdateSettings);
    }
    function updateModes() {
      vm.modes = R.thread($scope.state)(R.path(['settings', 'default', 'Misc']), R.keys, R.sortBy(R.identity));
      vm.mode = R.defaultTo(R.head(vm.modes), vm.mode);
    }
  }
})();
//# sourceMappingURL=settingsMiscCtrl.js.map
