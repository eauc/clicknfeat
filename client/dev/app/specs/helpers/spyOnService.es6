self.spyOnService = (function() {
  return function spyOnService(name) {
    let _service;
    angular.mock.inject([ name, (service) => {
      _service = service;
      R.thread(service)(
        R.keys,
        R.filter(R.compose(R.equals('Function'), R.type, R.flip(R.prop)(service))),
        R.reject(R.compose(R.equals('$'), R.last)),
        R.forEach((key) => {
          const arity = service[key].length;
          const mock_return_value = `${name}.${key}.returnValue`;
          if(R.last(key) === 'P') {
            self.spyOnPromise(service, key)
              .resolveWith(mock_return_value);
          }
          else {
            spyOn(service, key)
              .and.returnValue(mock_return_value);
          }
          service[key+'$'] = R.curryN(arity, service[key]);
        })
      );
    } ]);
    return _service;
  };
})();
