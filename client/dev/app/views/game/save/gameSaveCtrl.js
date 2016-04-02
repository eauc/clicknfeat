'use strict';

(function () {
  angular.module('clickApp.controllers').controller('gameSaveCtrl', gameSaveCtrl);

  gameSaveCtrl.$inject = ['$scope'];
  function gameSaveCtrl($scope) {
    var vm = this;
    console.log('init gameSaveCtrl');

    self.window.requestAnimationFrame(activate);

    function activate() {
      $scope.bindCell($scope.state.exports.game, function (game_exp) {
        console.error(game_exp);
        vm.game_export = game_exp;
        $scope.$digest();
      }, $scope);
    }
  }
})();
//# sourceMappingURL=gameSaveCtrl.js.map
