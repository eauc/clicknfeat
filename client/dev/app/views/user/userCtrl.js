'use strict';

angular.module('clickApp.controllers').controller('userCtrl', ['$scope', '$state', 'user', function ($scope, $state) {
  console.log('init userCtrl');

  $scope.state.user_ready.then(function () {
    console.log('copy user for edition', $scope.state.user);
    $scope.edit_user = R.clone($scope.state.user.state);
    $scope.$digest();
  });

  $scope.doSaveUser = function () {
    $state.go('lounge');
    $scope.stateEvent('User.set', $scope.edit_user);
  };
}]);
//# sourceMappingURL=userCtrl.js.map
