'use strict';

self.mockReturnPromise = (function() {
  return function mockReturnPromise(spy) {
    angular.mock.inject(function($rootScope, $q) {
      spy.and.callFake(function() {
        spy._defer = $q.defer();
        return spy._defer.promise;
      });
      spy.resolve = function() {
        var args = Array.prototype.slice.apply(arguments);
        var defer = spy._defer;
        defer.resolve.apply(defer, args);
        $rootScope.$digest();
      };
      spy.reject = function() {
        var args = Array.prototype.slice.apply(arguments);
        var defer = spy._defer;
        defer.reject.apply(defer, args);
        $rootScope.$digest();
      };
    });
  };
})();
