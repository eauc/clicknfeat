'use strict';

(function () {
  angular.module('clickApp.controllers').controller('appCtrl', appCtrl);

  appCtrl.$inject = ['$rootScope', '$state', 'appAction', 'appGame', 'appState', 'appTick', 'appUser', 'appData', 'appGames', 'appModes', 'allCommands', 'allModes'];
  function appCtrl($rootScope, $state, appActionService, appGameService, appStateService, appTickService, appUserService) {
    console.log('init appCtrl');

    var vm = this;
    vm.isNavHidden = isNavHidden;
    vm.stateIs = stateIs;
    vm.stateMatches = stateMatches;
    vm.goToState = goToState;

    $rootScope.sendAction = sendAction;
    $rootScope.bindCell = bindCell;
    $rootScope.listenSignal = listenSignal;

    activate();

    function activate() {
      bindCell(function (state) {
        $rootScope.state = state;
      }, appStateService.state, $rootScope);
      bindCell(onUserValid, appUserService.valid, $rootScope);
      listenSignal(function () {}, appGameService.connection_active, $rootScope);
      $rootScope.sendAction('Modes.reset');
    }

    function onUserValid(is_valid) {
      if (!is_valid) $state.go('user');
    }

    function sendAction() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      appActionService.action.send(args);
    }
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
    function listenSignal(listener, signal, scope) {
      var unsubscribe = signal.listen(listener);
      scope.$on('$destroy', unsubscribe);
    }

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
  }
})();
//# sourceMappingURL=appCtrl.js.map
