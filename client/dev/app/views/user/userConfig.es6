(function() {
  angular.module('clickApp')
    .config(userRoute)
    .run(checkUserOnStateTransition);

  userRoute.$inject = [
    '$stateProvider',
  ];
  function userRoute($stateProvider) {
    $stateProvider
      .state('user', {
        url: '/user',
        templateUrl: 'app/views/user/user.html',
        controller: 'userCtrl',
        controllerAs: 'user',
        data: {}
      });
  }
  checkUserOnStateTransition.$inject = [
    '$rootScope',
    '$state',
    'user'
  ];
  function checkUserOnStateTransition($rootScope, $state, userModel) {
    $rootScope.$on('$stateChangeStart', (event, toState) => {
      if(!$rootScope.state.user_ready.fulfilled) return;
      if(toState.name === 'user') return;

      console.log('Checking user on transition to', toState);
      if(userModel.isValid($rootScope.state.user)) return;

      $state.transitionTo('user');
      event.preventDefault();
    });
  }
})();
