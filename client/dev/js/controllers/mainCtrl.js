'use strict';

angular.module('clickApp.controllers').controller('mainCtrl', ['$scope', '$state', 'state', 'user', function ($scope, $state, stateService, userService) {
  console.log('init mainCtrl');

  $scope.state = stateService.init();
  $scope.stateEvent = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return stateService.event.apply(null, [].concat(args, [$scope.state]));
  };
  $scope.onStateChangeEvent = function (event, listener, scope) {
    var unsubscribe = stateService.onChangeEvent(event, listener, $scope.state);
    scope.$on('$destroy', function () {
      unsubscribe();
    });
  };
  $scope.digestOnStateChangeEvent = function (event, scope) {
    $scope.onStateChangeEvent(event, function () {
      scope.$digest();
    }, scope);
  };
  $scope.reloadFactions = function () {
    stateService.event('Factions.reload', $scope.state);
  };

  $scope.userIsValid = function () {
    return userService.isValid($scope.state.user);
  };
  $scope.checkUser = function () {
    if (!$scope.userIsValid()) {
      $state.go('user');
    }
  };
  $scope.onStateChangeEvent('User.change', $scope.checkUser, $scope);
  $scope.digestOnStateChangeEvent('User.change', $scope);

  $scope.goToState = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    self.setTimeout(function () {
      $state.go.apply($state, args);
    }, 100);
  };
  $scope.stateIs = function (name) {
    return $state.is(name);
  };
  $scope.stateMatches = function (match) {
    return 0 <= $state.current.name.indexOf(match);
  };
  $scope.currentState = function () {
    return $state.current;
  };
}]);
//# sourceMappingURL=mainCtrl.js.map
