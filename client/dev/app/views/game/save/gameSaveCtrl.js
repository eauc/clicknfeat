'use strict';

(function () {
  angular.module('clickApp.controllers').controller('gameSaveCtrl', gameSaveCtrl);

  gameSaveCtrl.$inject = ['$scope', 'appGame'];
  function gameSaveCtrl($scope, appGameService) {
    var vm = this;
    console.log('init gameSaveCtrl');

    self.window.requestAnimationFrame(activate);

    function activate() {
      $scope.bindCell(function (game_exp) {
        vm.game_export = game_exp;
      }, appGameService.export.game, $scope);
      $scope.bindCell(function (board_exp) {
        vm.board_export = board_exp;
      }, appGameService.export.board, $scope);
      // $scope.bindCell((models_exp) => {
      //   vm.models_export = models_exp;
      // }, $scope);
    }
  }
})();
//# sourceMappingURL=gameSaveCtrl.js.map
