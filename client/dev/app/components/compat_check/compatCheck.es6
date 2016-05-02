(function() {
  angular.module('clickApp.directives')
    .factory('compatCheck', compatCheckServiceFactory)
    .directive('clickCompatCheck', compatCheckDirectiveFactory);

  compatCheckServiceFactory.$inject = [];
  function compatCheckServiceFactory() {
    const compatCheckService = {
      check: compatCheck
    };

    R.curryService(compatCheckService);
    return compatCheckService;

    function compatCheck() {
      return R.thread([null])(
        R.ap([
          simpleCheck('requestAnimationFrame'),
          simpleCheck('Promise'),
          simpleCheck('FileReader'),
          () => {
            return ( R.exists(self.URL) || R.exists(self.webkitURL) ?
                     null :
                     'URL'
                   );
          },
          simpleCheck('Blob'),
          simpleCheck('localStorage'),
          simpleCheck('WebSocket'),
          simpleCheck('XMLHttpRequest'),
          simpleCheck('crypto')
        ]),
        R.reject(R.isNil)
      );
    }
    function simpleCheck(check) {
      return () => {
        return ( R.exists(self[check]) ?
                 null :
                 check
               );
      };
    }
  }

  compatCheckDirectiveFactory.$inject = [
    'compatCheck',
  ];
  function compatCheckDirectiveFactory(compatCheckService) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/compat_check/compat_check.html',
      link: link
    };

    function link(scope) {
      let compat_error = compatCheckService.check();
      scope.compat_error = R.isEmpty(compat_error) ? null : compat_error;
    }
  }
})();
