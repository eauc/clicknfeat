(function() {
  angular.module('clickApp.controllers')
    .controller('gameSaveCtrl', gameSaveCtrl);

  gameSaveCtrl.$inject = [
    '$scope',
  ];
  function gameSaveCtrl($scope) {
    const vm = this;
    console.log('init gameSaveCtrl');

    self.window.requestAnimationFrame(activate);

    function activate() {
      $scope.bindCell($scope.state.exports.game, (game_exp) => {
        vm.game_export = game_exp;
        $scope.$digest();
      }, $scope);
      $scope.bindCell($scope.state.exports.board, (board_exp) => {
        vm.board_export = board_exp;
        $scope.$digest();
      }, $scope);
    }
  }
})();
