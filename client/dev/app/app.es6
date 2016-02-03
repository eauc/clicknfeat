(function() {
  angular.module('clickApp.controllers', []);
  angular.module('clickApp.directives', []);
  angular.module('clickApp.filters', []);
  angular.module('clickApp.models', []);
  angular.module('clickApp.services', []);
  angular.module('clickApp', [
    'ui.router',
    'clickApp.controllers',
    'clickApp.directives',
    'clickApp.filters',
    'clickApp.models',
    'clickApp.services',
  ]);
})();
