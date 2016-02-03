(function() {
  angular.module('clickApp')
    .config(loungeRoute);

  loungeRoute.$inject = [
    '$stateProvider',
  ];
  function loungeRoute($stateProvider) {
    $stateProvider
      .state('lounge', {
        url: '/lounge',
        templateUrl: 'app/views/lounge/lounge.html',
        controller: 'loungeCtrl',
        controllerAs: 'lounge',
        data: {}
      });
  }
})();
