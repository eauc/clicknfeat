'use strict';

angular.module('clickApp.directives').factory('compatCheck', [function compatCheckServiceFactory() {
  var compatCheckService = {
    check: function compatCheck() {
      return R.pipe(R.ap([simpleCheck('requestAnimationFrame'), simpleCheck('Promise'), simpleCheck('FileReader'), function () {
        return R.exists(self.URL) || R.exists(self.webkitURL) ? null : 'URL';
      }, simpleCheck('Blob'), simpleCheck('localStorage'), simpleCheck('WebSocket'), simpleCheck('XMLHttpRequest'), simpleCheck('crypto')]), R.reject(R.isNil))([null]);
    }
  };
  function simpleCheck(check) {
    return function () {
      return R.exists(self[check]) ? null : check;
    };
  }
  R.curryService(compatCheckService);
  return compatCheckService;
}]).directive('clickCompatCheck', ['compatCheck', function (compatCheckService) {
  return {
    restrict: 'E',
    templateUrl: 'partials/directives/compat_check.html',
    link: function link(scope) {
      var compat_error = compatCheckService.check();
      scope.compat_error = R.isEmpty(compat_error) ? null : compat_error;
    }
  };
}]);
//# sourceMappingURL=compatCheck.js.map
