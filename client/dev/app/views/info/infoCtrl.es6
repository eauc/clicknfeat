(function() {
  angular.module('clickApp.controllers')
    .controller('infoCtrl', infoCtrl);

  infoCtrl.$inject = [];
  function infoCtrl() {
    console.log('init infoCtrl');
  }
})();
