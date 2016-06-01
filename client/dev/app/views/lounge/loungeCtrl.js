'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.controllers').controller('loungeCtrl', loungeCtrl);

  loungeCtrl.$inject = ['$scope', 'appGames'];
  function loungeCtrl($scope, appGamesService) {
    var vm = this;
    console.log('init loungeCtrl');

    vm.doUserToggleOnline = doUserToggleOnline;

    vm.localGamesIsEmpty = localGamesIsEmpty;
    vm.doCreateLocalGame = doCreateLocalGame;
    vm.doLoadLocalGame = doLoadLocalGame;
    vm.doOpenLocalGameFile = doOpenLocalGameFile;
    vm.doDeleteLocalGame = doDeleteLocalGame;

    vm.doCreateOnlineGame = doCreateOnlineGame;
    vm.doLoadOnlineGame = doLoadOnlineGame;
    vm.doOpenOnlineGameFile = doOpenOnlineGameFile;

    activate();

    function activate() {
      vm.local_games_selection = {};
      vm.online_games_selection = {};
      $scope.listenSignal(onGamesLocalLoadSuccess, appGamesService.load.local, $scope);
      $scope.listenSignal(onGamesOnlineLoadSuccess, appGamesService.load.online, $scope);
    }

    function doUserToggleOnline() {
      $scope.sendAction('User.toggleOnline');
    }

    function localGamesIsEmpty() {
      var ret = R.isEmpty($scope.state.local_games) || R.isEmpty(vm.local_games_selection.list);
      return ret;
    }
    function doCreateLocalGame() {
      $scope.sendAction('Games.local.create');
    }
    function doLoadLocalGame() {
      var id = R.thread($scope.state.local_games)(R.nth(vm.local_games_selection.list[0]), R.prop('local_stamp'));
      $scope.sendAction('Games.local.load', id);
    }
    function doOpenLocalGameFile(files) {
      $scope.sendAction('Games.local.loadFile', files[0]);
    }
    function doDeleteLocalGame() {
      var id = R.thread($scope.state.local_games)(R.nth(vm.local_games_selection.list[0]), R.prop('local_stamp'));
      $scope.sendAction('Games.local.delete', id);
    }
    function onGamesLocalLoadSuccess(id) {
      console.warn('load local game success', id);
      $scope.app.goToState('game.main', {
        online: 'offline',
        private: 'private',
        id: id
      });
    }

    function doCreateOnlineGame() {
      $scope.sendAction('Games.online.create');
    }
    function doLoadOnlineGame() {
      $scope.sendAction('Games.online.load', vm.online_games_selection.list[0]);
    }
    function doOpenOnlineGameFile(files) {
      $scope.sendAction('Games.online.loadFile', files[0]);
    }
    function onGamesOnlineLoadSuccess(_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var is_private = _ref2[0];
      var id = _ref2[1];

      console.warn('load online game success', arguments, id, is_private);
      $scope.app.goToState('game.main', {
        online: 'online',
        private: is_private,
        id: id
      });
    }
  }
})();
//# sourceMappingURL=loungeCtrl.js.map
