'use strict';

(function () {
  angular.module('clickApp.controllers').controller('appCtrl', appCtrl);

  appCtrl.$inject = ['$rootScope', '$state', 'state', 'user'];
  function appCtrl($rootScope, $state, stateService, userModel) {
    console.log('init appCtrl');

    var vm = this;
    vm.isNavHidden = isNavHidden;
    vm.stateIs = stateIs;
    vm.stateMatches = stateMatches;

    $rootScope.state = stateService.init();
    $rootScope.stateEvent = stateEvent;
    // $scope.onStateChangeEvent = onStateChangeEvent;
    // $scope.digestOnStateChangeEvent = digestOnStateChangeEvent;
    // $scope.reloadFactions = reloadFactions;

    // $scope.userIsValid = userIsValid;
    // $scope.checkUser = checkUser;

    $rootScope.goToState = goToState;

    activate();

    function stateEvent() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return stateService.queueEvent(args, $rootScope.state);
    }
    // function onStateChangeEvent(event, listener, scope) {
    //   let unsubscribe = stateService
    //         .onChangeEvent(event, listener, $scope.state);
    //   scope.$on('$destroy', () => { unsubscribe(); });
    // }
    // function digestOnStateChangeEvent(event, scope) {
    //   $scope.onStateChangeEvent(event, () => {
    //     scope.$digest();
    //   }, scope);
    // }
    // function reloadFactions() {
    //   stateService.event('Factions.reload', $scope.state);
    // }

    // function userIsValid() {
    //   return userService.isValid($scope.state.user);
    // }
    // function checkUser() {
    //   if(!$scope.userIsValid()) {
    //     $state.go('user');
    //   }
    // }

    function isNavHidden() {
      return R.path(['current', 'data', 'hide_nav'], $state);
    }
    function stateIs(name) {
      return $state.is(name);
    }
    function stateMatches(match) {
      return 0 <= $state.current.name.indexOf(match);
    }
    function goToState() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      self.setTimeout(function () {
        $state.go.apply($state, args);
      }, 100);
    }
    // function currentState() {
    //   return $state.current;
    // }

    function activate() {
      $rootScope.state.user_ready.then(checkUserOnInit);
      //   $scope.onStateChangeEvent('User.change', $scope.checkUser, $scope);
      //   $scope.digestOnStateChangeEvent('User.change', $scope);
    }
    function checkUserOnInit() {
      console.log('Checking user on init');
      if (userModel.isValid($rootScope.state.user)) return;

      $state.transitionTo('user');
    }
  }
})();
//# sourceMappingURL=appCtrl.js.map
