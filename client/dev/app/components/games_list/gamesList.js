'use strict';

(function () {
  angular.module('clickApp.directives').controller('gamesListCtrl', gamesListCtrl).directive('clickGamesList', gamesListDirectiveFactory);

  function gamesListDirectiveFactory() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/games_list/games_list.html',
      scope: {},
      link: function link() {},
      controller: 'gamesListCtrl',
      controllerAs: 'vm',
      bindToController: {
        games: '=',
        selection: '=',
        current: '='
      }
    };
  }
  gamesListCtrl.$inject = ['$scope'];
  function gamesListCtrl($scope) {
    var vm = this;
    console.log('gamesListCtrl', vm.games);

    vm.selection.list = [];
    vm.isInSelection = isInSelection;
    vm.doSetSelection = doSetSelection;

    activate();

    function activate() {
      $scope.$watch('vm.games', function () {
        setSelection();
      });
    }
    function isInSelection(index) {
      return R.exists(R.find(R.equals(index), vm.selection.list));
    }
    function selectionIsEmpty() {
      return R.isEmpty(vm.selection.list);
    }
    function doSetSelection(index) {
      if (R.exists(vm.current) && vm.games[index].public_stamp === vm.current) return;

      setSelection(index);
    }
    function setSelection(index) {
      R.thread(index)(R.defaultTo(R.head(vm.selection.list)), R.defaultTo(0), R.min(R.length(vm.games) - 1), R.max(0), function (index) {
        vm.selection.list = [index];
      });
    }
  }
})();
//# sourceMappingURL=gamesList.js.map
