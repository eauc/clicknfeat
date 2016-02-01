angular.module('clickApp.directives')
  .factory('compatCheck', [
    function compatCheckServiceFactory() {
      var compatCheckService = {
        check: function compatCheck() {
          return R.pipe(
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
          )([null]);
        },
      };
      function simpleCheck(check) {
        return () => {
          return ( R.exists(self[check]) ?
                   null :
                   check
                 );
        };
      }
      R.curryService(compatCheckService);
      return compatCheckService;
    }
  ])
  .directive('clickCompatCheck', [
    'compatCheck',
    function(compatCheckService) {
      return {
        restrict: 'E',
        templateUrl: 'partials/directives/compat_check.html',
        link: function(scope) {
          let compat_error = compatCheckService.check();
          scope.compat_error = R.isEmpty(compat_error) ? null : compat_error;
        }
      };
    }
  ]);
