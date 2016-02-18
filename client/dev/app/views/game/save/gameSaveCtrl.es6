(function() {
  angular.module('clickApp.controllers')
    .controller('gameSaveCtrl', gameSaveCtrl);

  gameSaveCtrl.$inject = [
    '$scope',
  ];
  function gameSaveCtrl($scope) {
    const vm = this;
    console.log('init gameSaveCtrl');

    activate();

    function activate() {
      $scope.onStateChangeEvent('Exports.game', updateExports, $scope);
      $scope.onStateChangeEvent('Exports.board', updateExports, $scope);
      $scope.onStateChangeEvent('Exports.models', updateExports, $scope);
      self.requestAnimationFrame(updateExports);
    }
    function updateExports() {
      vm.exports = R.path(['state','exports'], $scope);
      $scope.$digest();
    }
  }
})();
