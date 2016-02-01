'use strict';

(function () {
  angular.module('clickApp.controllers').controller('appCtrl', appCtrl);

  appCtrl.$inject = ['$scope', '$state'];

  // 'state',
  // 'user',
  function appCtrl($scope, $state, stateService, userService) {
    console.log('init appCtrl');

    var vm = this;
    vm.isNavHidden = isNavHidden;
    vm.stateIs = stateIs;
    vm.stateMatches = stateMatches;

    // $scope.state = stateService.init();
    // $scope.stateEvent = stateEvent;
    // $scope.onStateChangeEvent = onStateChangeEvent;
    // $scope.digestOnStateChangeEvent = digestOnStateChangeEvent;
    // $scope.reloadFactions = reloadFactions;

    // $scope.userIsValid = userIsValid;
    // $scope.checkUser = checkUser;

    // $scope.goToState = goToState;

    // activate();

    // function stateEvent(...args) {
    //   return stateService.event
    //     .apply(null, [...args, $scope.state]);
    // }
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
    // function goToState(...args) {
    //   self.setTimeout(() => {
    //     $state.go.apply($state, args);
    //   }, 100);
    // }
    // function currentState() {
    //   return $state.current;
    // }

    // function activate() {
    //   $scope.onStateChangeEvent('User.change', $scope.checkUser, $scope);
    //   $scope.digestOnStateChangeEvent('User.change', $scope);
    // }
  }
})();
//# sourceMappingURL=appCtrl.js.map
