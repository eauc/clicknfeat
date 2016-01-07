angular.module('clickApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$state',
    'state',
    'user',
    function($scope,
             $state,
             stateService,
             userService) {
      console.log('init mainCtrl');

      $scope.state = stateService.init();
      $scope.stateEvent = (...args) => {
        return stateService.event
          .apply(null, [...args, $scope.state]);
      };
      $scope.onStateChangeEvent = (event, listener, scope) => {
        let unsubscribe = stateService
              .onChangeEvent(event, listener, $scope.state);
        scope.$on('$destroy', () => { unsubscribe(); });
      };
      $scope.digestOnStateChangeEvent = (event, scope) => {
        $scope.onStateChangeEvent(event, () => {
          scope.$digest();
        }, scope);
      };
      $scope.reloadFactions = () => {
        stateService.event('Factions.reload', $scope.state);
      };

      $scope.userIsValid = () => {
        return userService.isValid($scope.state.user);
      };
      $scope.checkUser = () => {
        if(!$scope.userIsValid()) {
          $state.go('user');
        }
      };
      $scope.onStateChangeEvent('User.change', $scope.checkUser, $scope);
      $scope.digestOnStateChangeEvent('User.change', $scope);
      
      $scope.goToState = (...args) => {
        self.setTimeout(() => {
          $state.go.apply($state, args);
        }, 100);
      };
      $scope.stateIs = (name) => {
        return $state.is(name);
      };
      $scope.stateMatches = (match) => {
        return 0 <= $state.current.name.indexOf(match);
      };
      $scope.currentState = () => {
        return $state.current;
      };
    }
  ]);
