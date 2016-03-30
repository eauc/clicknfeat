'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.controllers').controller('appCtrl', appCtrl);

  appCtrl.$inject = ['$rootScope', '$state', 'appState', 'stateUser'];
  function appCtrl($rootScope, $state, appStateService) {
    console.log('init appCtrl');

    var vm = this;
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

    activate();

    function activate() {
      $rootScope.onStateChangeEvent('AppState.change', function (_event_, _ref) {
        var _ref2 = _slicedToArray(_ref, 1);

        var new_state = _ref2[0];

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

    function stateEvent() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return appStateService.reduce.apply(appStateService, args);
    }
    // function stateChangeEvent(...args) {
    //   return appStateService.emit(appStateService, args);
    // }
    function onStateChangeEvent(event, listener, scope) {
      appStateService.addListener(event, listener);
      scope.$on('$destroy', function () {
        appStateService.removeListener(event, listener);
      });
    }
    function digestOnStateChangeEvent(event, scope) {
      onStateChangeEvent(event, function () {
        scope.$digest();
      }, scope);
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
