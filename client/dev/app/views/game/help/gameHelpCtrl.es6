(function() {
  angular.module('clickApp.controllers')
    .controller('gameHelpCtrl', gameHelpCtrl);

  gameHelpCtrl.$inject = [
    '$scope',
    'appModes',
    'modes',
  ];
  function gameHelpCtrl($scope,
                        appModesService,
                        modesModel) {
    const vm = this;
    console.log('init gameHelpCtrl');

    activate();

    function activate() {
      $scope.bindCell((modes) => {
        vm.bindings_pairs = R.thread(modes)(
          modesModel.currentModeBindingsPairs,
          R.sortBy(R.head)
        );
      }, appModesService.modes, $scope);
    }
  }
})();
