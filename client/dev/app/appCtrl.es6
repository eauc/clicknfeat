(function() {
  angular.module('clickApp.controllers')
    .controller('appCtrl', appCtrl);

  appCtrl.$inject = [
    '$rootScope',
    '$state',
    'appAction',
    'appState',
    'appTick',
    'appGame',
    'appGames',
    'appModes',
    'appUser',
    // 'stateData',
  ];
  function appCtrl($rootScope,
                   $state,
                   appActionService,
                   appStateService,
                   appTickService) {
    console.log('init appCtrl');

    const vm = this;
    vm.isNavHidden = isNavHidden;
    vm.stateIs = stateIs;
    vm.stateMatches = stateMatches;
    vm.goToState = goToState;

    $rootScope.sendAction = sendAction;
    $rootScope.bindCell = bindCell;
    $rootScope.listenSignal = listenSignal;

    activate();

    function activate() {
      bindCell((state) => { $rootScope.state = state; },
               appStateService.state, $rootScope);
    }

    // function onUserInvalid() {
    //   $state.go('user');
    //   $rootScope.$digest();
    // }

    function sendAction(...args) {
      appActionService.action.send(args);
    }
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
    function listenSignal(listener, signal, scope) {
      const unsubscribe = signal.listen(listener);
      scope.$on('$destroy', unsubscribe);
    }

    function isNavHidden() {
      return R.path(['current', 'data', 'hide_nav' ], $state);
    }
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
