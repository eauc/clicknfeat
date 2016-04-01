'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.controllers').controller('loungeCtrl', loungeCtrl);

  loungeCtrl.$inject = ['$scope'];
  function loungeCtrl($scope) {
    var vm = this;
    console.log('init loungeCtrl');

    vm.localGamesIsEmpty = localGamesIsEmpty;
    vm.doCreateLocalGame = doCreateLocalGame;
    vm.doLoadLocalGame = doLoadLocalGame;
    vm.doOpenLocalGameFile = doOpenLocalGameFile;
    vm.doDeleteLocalGame = doDeleteLocalGame;

    vm.doUserToggleOnline = doUserToggleOnline;

    vm.doCreateOnlineGame = doCreateOnlineGame;
    vm.doLoadOnlineGame = doLoadOnlineGame;
    vm.doOpenOnlineGameFile = doOpenOnlineGameFile;

    activate();

    function activate() {
      vm.local_games_selection = {};
      vm.online_games_selection = {};
      $scope.digestOnStateChangeEvent('Games.local.change', $scope);
      $scope.digestOnStateChangeEvent('Games.online.change', $scope);
      $scope.onStateChangeEvent('Games.local.load', onGamesLocalLoad, $scope);
      $scope.onStateChangeEvent('Games.online.load', onGamesOnlineLoad, $scope);
    }

    function localGamesIsEmpty() {
      var ret = R.isEmpty($scope.state.local_games) || R.isEmpty(vm.local_games_selection.list);
      return ret;
    }
    function doCreateLocalGame() {
      $scope.stateEvent('Games.local.create');
    }
    function doLoadLocalGame() {
      var id = R.thread($scope.state.local_games)(R.nth(vm.local_games_selection.list[0]), R.prop('local_stamp'));
      $scope.stateEvent('Games.local.load', id);
    }
    function doOpenLocalGameFile(files) {
      $scope.stateEvent('Games.local.loadFile', files[0]);
    }
    function doDeleteLocalGame() {
      var id = R.thread($scope.state.local_games)(R.nth(vm.local_games_selection.list[0]), R.prop('local_stamp'));
      $scope.stateEvent('Games.local.delete', id);
    }
    function onGamesLocalLoad(_event_, _ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var id = _ref2[0];

      $scope.goToState('game.main', {
        online: 'offline',
        private: 'private',
        id: id
      });
      $scope.$digest();
    }

    function doUserToggleOnline() {
      $scope.stateEvent('User.toggleOnline');
    }

    function doCreateOnlineGame() {
      $scope.stateEvent('Games.online.create');
    }
    function doLoadOnlineGame() {
      R.thread($scope.state)(R.pathOr([], ['user', 'connection', 'games']), R.nth(vm.online_games_selection.list[0]), R.defaultTo({}), R.propOr('null', 'public_stamp'), function (id) {
        $scope.stateEvent('Games.online.load', id);
      });
    }
    function doOpenOnlineGameFile(files) {
      $scope.stateEvent('Games.online.loadFile', files[0]);
    }
    function onGamesOnlineLoad(_event_, _ref3) {
      var _ref4 = _slicedToArray(_ref3, 2);

      var isPrivate = _ref4[0];
      var id = _ref4[1];

      $scope.goToState('game.main', {
        online: 'online',
        private: isPrivate,
        id: id
      });
      $scope.$digest();
    }
  }
})();
//# sourceMappingURL=loungeCtrl.js.map
