(function() {
  angular.module('clickApp.controllers')
    .controller('userCtrl', userCtrl);

  userCtrl.$inject = [
    '$scope'
  ];
  function userCtrl($scope) {
    const vm = this;
    console.log('init userCtrl');

    vm.doSave = doSave;
    activate();

    function doSave() {
      $scope.stateEvent('User.set', { state: vm.edit });
    }

    function activate() {
      $scope.state.user_ready.then(() => {
        console.log('copy user for edition', $scope.state.user);
        vm.edit = R.clone($scope.state.user.state);
        $scope.$digest();
      });
      $scope.onStateChangeEvent('User.becomesValid',
                                () => { $scope.goToState('lounge'); },
                                $scope);
    }
  }
})();
