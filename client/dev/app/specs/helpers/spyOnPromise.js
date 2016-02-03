'use strict';

self.spyOnPromise = function () {
  return function spyOnPromise(object, key) {
    var spy = spyOn(object, key);
    var resolve_value = undefined;
    var reject_value = undefined;
    spy.resolveWith = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      resolve_value = args;
    };
    spy.rejectWith = function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      reject_value = args;
    };

    spy.and.callFake(function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return new self.Promise(function (resolve, reject) {
        spy.resolve = resolve;
        spy.reject = reject;

        if (R.exists(reject_value)) {
          if (R.length(reject_value) === 1 && R.type(reject_value[0]) === 'Function') {
            reject(reject_value[0].apply(null, args));
          } else {
            reject.apply(null, reject_value);
          }
        }
        if (R.exists(resolve_value)) {
          if (R.length(resolve_value) === 1 && R.type(resolve_value[0]) === 'Function') {
            resolve(resolve_value[0].apply(null, args));
          } else {
            resolve.apply(null, resolve_value);
          }
        }
      });
    });

    return spy;
  };
}();
//# sourceMappingURL=spyOnPromise.js.map
