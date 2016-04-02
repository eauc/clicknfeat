'use strict';

(function () {
  angular.module('clickApp.controllers').controller('gameHelpCtrl', gameHelpCtrl);

  gameHelpCtrl.$inject = ['$scope', 'modes'];
  function gameHelpCtrl($scope, modesModel) {
    var vm = this;
    console.log('init gameHelpCtrl');

    $scope.onStateChangeEvent('Modes.change', updateBindings, $scope);
    self.requestAnimationFrame(updateBindings);

    function updateBindings() {
      vm.bindings_pairs = R.thread($scope)(R.path(['state', 'modes']), modesModel.currentModeBindingsPairs, R.sortBy(R.head));
      $scope.$digest();
    }
  }
})();
//# sourceMappingURL=gameHelpCtrl.js.map
