angular.module('clickApp.directives')
  .controller('gamesListCtrl', [
    '$scope',
    function userConnectionCtrl($scope) {
      console.log('gamesListCtrl', $scope.games);

      $scope.selection.list = [];
      $scope.isInSelection = (index) => {
        return R.exists(R.find(R.equals(index), $scope.selection.list));
      };
      $scope.selectionIsEmpty = () => {
        return R.isEmpty($scope.selection.list);
      };
      function setSelection(index) {
        R.pipe(
          R.defaultTo(R.head($scope.selection.list)),
          R.defaultTo(0),
          R.min(R.length($scope.games)-1),
          R.max(0),
          (index) => {
            $scope.selection.list = [index];
          }
        )(index);
      }
      $scope.doSetSelection = (index) => {
        if(R.exists($scope.current) &&
           $scope.games[index].public_stamp === $scope.current) return;

        setSelection(index);
      };
      $scope.$watch('games', () => { setSelection(); });
    }
  ])
  .directive('clickGamesList', [
    function() {
      return {
        restrict: 'E',
        controller: 'gamesListCtrl',
        templateUrl: 'partials/directives/games_list.html',
        scope: {
          games: '=',
          selection: '=',
          current: '='
        },
        link: () => { }
      };
    }
  ]);
