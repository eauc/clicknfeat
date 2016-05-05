'use strict';

(function () {
  angular.module('clickApp.controllers').controller('userCtrl', userCtrl);

  userCtrl.$inject = ['$scope', 'appUser'];
  function userCtrl($scope, appUserService) {
    var vm = this;
    console.log('init userCtrl');

    vm.doSave = doSave;
    activate();

    function doSave() {
      $scope.sendAction('User.updateState', vm.edit);
      $scope.goToState('lounge');
    }

    function activate() {
      $scope.bindCell(function (user) {
        console.log('copy user for edition', user);
        vm.edit = R.clone(user.state);
      }, appUserService.user, $scope);
    }
  }
})();
//# sourceMappingURL=userCtrl.js.map
