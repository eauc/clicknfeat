'use strict';

angular.module('clickApp.directives').controller('gamesListCtrl', ['$scope', function userConnectionCtrl($scope) {
  console.log('gamesListCtrl', $scope.games);

  $scope.selection.list = [];
  $scope.isInSelection = function (index) {
    return R.exists(R.find(R.equals(index), $scope.selection.list));
  };
  $scope.selectionIsEmpty = function () {
    return R.isEmpty($scope.selection.list);
  };
  $scope.setSelection = function (index) {
    if (R.isEmpty($scope.games)) {
      $scope.selection.list = [];
    } else {
      $scope.selection.list = [Math.min(R.length($scope.games) - 1, index)];
    }
    console.log('GamesList: selection', $scope.selection.list);
  };
}]).directive('clickGamesList', [function () {
  return {
    restrict: 'E',
    controller: 'gamesListCtrl',
    templateUrl: 'partials/directives/games_list.html',
    scope: {
      games: '=',
      selection: '='
    },
    link: function link() /*scope, element, attrs*/{}
  };
}]);
//# sourceMappingURL=gamesList.js.map
