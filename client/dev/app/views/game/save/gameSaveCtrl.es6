(function() {
  angular.module('clickApp.controllers')
    .controller('gameSaveCtrl', gameSaveCtrl);

  gameSaveCtrl.$inject = [
    '$scope',
    'appGame',
  ];
  function gameSaveCtrl($scope,
                       appGameService) {
    const vm = this;
    console.log('init gameSaveCtrl');

    self.window.requestAnimationFrame(activate);

    function activate() {
      $scope.bindCell((game_exp) => {
        vm.game_export = game_exp;
      }, appGameService.export.game, $scope);
      $scope.bindCell((board_exp) => {
        vm.board_export = board_exp;
      }, appGameService.export.board, $scope);
      $scope.bindCell((models_exp) => {
        vm.models_export = models_exp;
      }, appGameService.export.models, $scope);
    }
  }
})();
