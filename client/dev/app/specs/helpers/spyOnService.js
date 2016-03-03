'use strict';

self.spyOnService = function () {
  return function spyOnService(name) {
    var _service = undefined;
    angular.mock.inject([name, function (service) {
      _service = service;
      R.thread(service)(R.keysIn, R.filter(R.compose(R.equals('Function'), R.type, R.flip(R.prop)(service))), R.reject(R.compose(R.equals('$'), R.last)), R.forEach(function (key) {
        var arity = service[key].length;
        var mock_return_value = name + '.' + key + '.returnValue';
        if (R.last(key) === 'P') {
          self.spyOnPromise(service, key).resolveWith(mock_return_value);
        } else {
          spyOn(service, key).and.returnValue(mock_return_value);
        }
        service[key + '$'] = R.curryN(arity, service[key]);
      }));
    }]);
    return _service;
  };
}();
//# sourceMappingURL=spyOnService.js.map
