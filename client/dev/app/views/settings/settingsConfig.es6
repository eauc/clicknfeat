(function() {
  angular.module('clickApp')
    .config(settingsRoute);

  settingsRoute.$inject = [
    '$stateProvider',
  ];
  function settingsRoute($stateProvider) {
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'app/views/settings/settings.html',
        controller: 'settingsCtrl',
        controllerAs: 'settings',
        data: {}
      })
      .state('settings.Main', {
        url: '/main',
        templateUrl: 'app/views/settings/main/settings_main.html',
        controller: 'settingsMainCtrl',
        controllerAs: 'settings_main'
      })
      .state('settings.Models', {
        url: '/models',
        templateUrl: 'app/views/settings/models/settings_models.html',
        controller: 'settingsModelsCtrl',
        controllerAs: 'settings_models'
      })
      .state('settings.Bindings', {
        url: '/bindings',
        templateUrl: 'app/views/settings/bindings/settings_bindings.html',
        controller: 'settingsBindingsCtrl',
        controllerAs: 'settings_bindings'
      })
      .state('settings.Misc', {
        url: '/misc',
        templateUrl: 'app/views/settings/misc/settings_misc.html',
        controller: 'settingsMiscCtrl',
        controllerAs: 'settings_misc'
      });
  }
})();
