(function() {
  angular.module('clickApp.directives')
    .directive('clickErrorToaster', errorToasterDirectiveFactory);

  errorToasterDirectiveFactory.$inject = [
    'appError',
  ];
  function errorToasterDirectiveFactory(appErrorService) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/error_toaster/error_toaster.html',
      scope: {},
      link: link
    };

    function link(scope, element) {
      element = element[0];
      let timeout;
      appErrorService.addListener(onError);
      scope.msg = null;

      function onError(_event_, msg) {
        if(timeout) {
          self.window.clearTimeout(timeout);
        }
        self.window.requestAnimationFrame(() => {
          scope.msg = R.head(R.unless(R.isArrayLike, R.of)(msg));
          scope.$digest();
        });
        timeout = self.window.setTimeout(hide, 2000);
      }
      function hide() {
        scope.msg = null;
        scope.$digest();
      }
    }
  }
})();
