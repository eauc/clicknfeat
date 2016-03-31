(function() {
  angular.module('clickApp.controllers')
    .controller('appCtrl', appCtrl);

  appCtrl.$inject = [
    '$rootScope',
    '$state',
    'appState',
    'stateData',
    'stateUser',
  ];
  function appCtrl($rootScope,
                   $state,
                   appStateService) {
    console.log('init appCtrl');

    const vm = this;
    vm.isNavHidden = isNavHidden;
    vm.stateIs = stateIs;
    vm.stateMatches = stateMatches;
    vm.goToState = goToState;

    $rootScope.stateIs = stateIs;
    $rootScope.goToState = goToState;

    $rootScope.stateEvent = stateEvent;
    // $rootScope.stateChangeEvent = stateChangeEvent;
    $rootScope.onStateChangeEvent = onStateChangeEvent;
    $rootScope.digestOnStateChangeEvent = digestOnStateChangeEvent;
    $rootScope.bindCell = bindCell;

    activate();

    function activate() {
      $rootScope.onStateChangeEvent('AppState.change', (_event_, [new_state]) => {
        $rootScope.state = new_state;
      }, $rootScope);
      $rootScope.onStateChangeEvent('User.becomesInvalid', onUserInvalid, $rootScope);
      $rootScope.digestOnStateChangeEvent('User.state.change', $rootScope);
      $rootScope.state = appStateService.init();
    }

    function onUserInvalid() {
      $state.go('user');
      $rootScope.$digest();
    }

    function stateEvent(...args) {
      return appStateService.reduce.apply(appStateService, args);
    }
    // function stateChangeEvent(...args) {
    //   return appStateService.emit(appStateService, args);
    // }
    function onStateChangeEvent(event, listener, scope) {
      appStateService.addListener(event, listener);
      scope.$on('$destroy', () => {
        appStateService.removeListener(event, listener);
      });
    }
    function digestOnStateChangeEvent(event, scope) {
      onStateChangeEvent(event, () => {
        scope.$digest();
      }, scope);
    }
    function bindCell(cell, listener, scope) {
      const unbind = cell.bind(listener);
      scope.$on('$destroy', unbind);
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
