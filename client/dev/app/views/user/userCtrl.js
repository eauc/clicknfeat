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
      $scope.stateEvent('User.set', vm.edit).then(function () {
        $scope.goToState('lounge');
      });
    }

    function activate() {
      $scope.state.user_ready.then(function () {
        console.log('copy user for edition', $scope.state.user);
        vm.edit = R.clone($scope.state.user.state);
        $scope.$digest();
      });
    }
  }
})();
//# sourceMappingURL=userCtrl.js.map
