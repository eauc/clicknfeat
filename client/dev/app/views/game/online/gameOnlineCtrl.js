'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.controllers').controller('gameOnlineCtrl', gameOnlineCtrl);

  gameOnlineCtrl.$inject = ['$scope', 'appGames', 'appUser'];
  function gameOnlineCtrl($scope, appGamesService, appUserService) {
    var vm = this;
    console.log('init gameOnlineCtrl');

    vm.doLoadOnlineGame = doLoadOnlineGame;

    activate();

    function activate() {
      vm.games_selection = {};

      $scope.listenSignal(onGamesOnlineLoadSuccess, appGamesService.load.online, $scope);
      appUserService.ready.then(function () {
        $scope.bindCell(checkUserOnline, appUserService.online, $scope);
      });
    }

    function checkUserOnline(is_online) {
      if (!is_online) {
        $scope.app.goToState('^.main');
      }
    }

    function doLoadOnlineGame() {
      $scope.sendAction('Games.online.load', vm.games_selection.list[0]);
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
//# sourceMappingURL=gameOnlineCtrl.js.map
