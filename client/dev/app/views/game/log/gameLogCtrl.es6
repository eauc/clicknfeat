(function() {
  angular.module('clickApp.controllers')
    .controller('gameLogCtrl', gameLogCtrl);

  gameLogCtrl.$inject = [
    '$scope',
  ];
  function gameLogCtrl(_$scope_) {
    // const vm = this;
    console.log('init gameLogCtrl');

    activate();

    function activate() {}
  }
})();
