(function() {
  angular.module('clickApp.controllers')
    .controller('appCtrl', appCtrl);

  appCtrl.$inject = [
    '$rootScope',
    '$state',
    'appTick',
    'appState',
    'appAction',
    'appUser',
    // 'stateData',
    // 'stateGame',
    // 'stateGames',
    // 'stateModes',
    // 'stateUser',
  ];
  function appCtrl($rootScope,
                   $state,
                   appTickService,
                   appStateService,
                   appActionService) {
    console.log('init appCtrl');

    const vm = this;
    // vm.isNavHidden = isNavHidden;
    vm.stateIs = stateIs;
    vm.stateMatches = stateMatches;
    // vm.goToState = goToState;

    // $rootScope.stateIs = stateIs;
    $rootScope.goToState = goToState;

    $rootScope.sendAction = sendAction;
    // $rootScope.onStateChangeEvent = onStateChangeEvent;
    // $rootScope.digestOnStateChangeEvent = digestOnStateChangeEvent;
    $rootScope.bindCell = bindCell;

    activate();

    function activate() {
      bindCell((state) => { $rootScope.state = state; },
               appStateService.state, $rootScope);
      // $rootScope.onStateChangeEvent('User.becomesInvalid', onUserInvalid, $rootScope);
      // $rootScope.state = appStateService.init();
    }

    // function onUserInvalid() {
    //   $state.go('user');
    //   $rootScope.$digest();
    // }

    function sendAction(...args) {
      appActionService.action.send(args);
    }
    // function onStateChangeEvent(event, listener, scope) {
    //   appStateService.addListener(event, listener);
    //   scope.$on('$destroy', () => {
    //     appStateService.removeListener(event, listener);
    //   });
    // }
    // function digestOnStateChangeEvent(event, scope) {
    //   onStateChangeEvent(event, () => {
    //     scope.$digest();
    //   }, scope);
    // }
    function bindCell(bind, cell, scope) {
      const listener = () => {
        bind(cell.sample());
      };
      appTickService.addTickListener(listener);
      scope.$on('$destroy', () => {
        appTickService.removeTickListener(listener);
      });
      listener();
    }

    // function isNavHidden() {
    //   return R.path(['current', 'data', 'hide_nav' ], $state);
    // }
    function stateIs(name) {
      return $state.is(name);
    }
    function stateMatches(match) {
      return 0 <= $state.current.name.indexOf(match);
    }
    function goToState(...args) {
      self.setTimeout(() => {
        $state.go.apply($state, args);
      }, 100);
    }
  }
})();
