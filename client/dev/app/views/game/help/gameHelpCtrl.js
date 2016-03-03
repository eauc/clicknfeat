'use strict';

(function () {
  angular.module('clickApp.controllers').controller('gameHelpCtrl', gameHelpCtrl);

  gameHelpCtrl.$inject = ['$scope', 'modes'];
  function gameHelpCtrl($scope, modesModel) {
    var vm = this;
    console.log('init gameHelpCtrl');

    $scope.onStateChangeEvent('Exports.dump', updateDump, $scope);
    self.requestAnimationFrame(updateDump);
    $scope.onStateChangeEvent('Modes.change', updateBindings, $scope);
    self.requestAnimationFrame(updateBindings);

    function updateDump() {
      vm.exports = R.clone(R.path(['state', 'exports'], $scope));
      $scope.$digest();
    }
    function updateBindings() {
      vm.bindings_pairs = R.thread($scope)(R.path(['state', 'modes']), modesModel.currentModeBindingsPairs, R.sortBy(R.head));
      $scope.$digest();
    }
  }
})();
//# sourceMappingURL=gameHelpCtrl.js.map
