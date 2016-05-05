'use strict';

(function () {
  angular.module('clickApp.controllers').controller('appCtrl', appCtrl);

  appCtrl.$inject = ['$rootScope', '$state', 'appTick', 'appState', 'appAction', 'appUser'];

  // 'stateData',
  // 'stateGame',
  // 'stateGames',
  // 'stateModes',
  // 'stateUser',
  function appCtrl($rootScope, $state, appTickService, appStateService, appActionService) {
    console.log('init appCtrl');

    var vm = this;
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
      bindCell(function (state) {
        $rootScope.state = state;
      }, appStateService.state, $rootScope);
      // $rootScope.onStateChangeEvent('User.becomesInvalid', onUserInvalid, $rootScope);
      // $rootScope.state = appStateService.init();
    }

    // function onUserInvalid() {
    //   $state.go('user');
    //   $rootScope.$digest();
    // }

    function sendAction() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

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
      var listener = function listener() {
        bind(cell.sample());
      };
      appTickService.addTickListener(listener);
      scope.$on('$destroy', function () {
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
    function goToState() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      self.setTimeout(function () {
        $state.go.apply($state, args);
      }, 100);
    }
  }
})();
//# sourceMappingURL=appCtrl.js.map
