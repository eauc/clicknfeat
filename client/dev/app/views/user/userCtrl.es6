(function() {
  angular.module('clickApp.controllers')
    .controller('userCtrl', userCtrl);

  userCtrl.$inject = [
    '$scope',
    'appUser',
  ];
  function userCtrl($scope,
                    appUserService) {
    const vm = this;
    console.log('init userCtrl');

    vm.doSave = doSave;
    activate();

    function doSave() {
      $scope.sendAction('User.updateState', vm.edit);
      $scope.app.goToState('lounge');
    }

    function activate() {
      $scope.bindCell((user) => {
        console.log('copy user for edition', user);
        vm.edit = R.clone(user.state);
      }, appUserService.user, $scope);
    }
  }
})();
