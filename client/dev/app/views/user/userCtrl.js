'use strict';

(function () {
  angular.module('clickApp.controllers').controller('userCtrl', userCtrl);

  userCtrl.$inject = ['$scope'];
  function userCtrl($scope) {
    var vm = this;
    console.log('init userCtrl');

    vm.doSave = doSave;
    activate();

    function doSave() {
      $scope.stateEvent('User.set', { state: vm.edit });
    }

    function activate() {
      $scope.state.user_ready.then(function () {
        console.log('copy user for edition', $scope.state.user);
        vm.edit = R.clone($scope.state.user.state);
        $scope.$digest();
      });
      $scope.onStateChangeEvent('User.becomesValid', function () {
        $scope.goToState('lounge');
      }, $scope);
    }
  }
})();
//# sourceMappingURL=userCtrl.js.map
