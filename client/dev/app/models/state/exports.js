'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

angular.module('clickApp.services').factory('stateExports', ['fileExport', function stateExportsServiceFactory(fileExportService) {
  var cleanupExport$ = R.curry(function (path, exports) {
    return R.pipe(R.path([].concat(_toConsumableArray(path), ['url'])), fileExportService.cleanup, R.always(exports), R.assocPath([].concat(_toConsumableArray(path), ['url']), null))(exports);
  });
  var stateExportsService = {
    init: function stateExportsInit(state) {
      state.exports = {};
      return state;
    },
    rejectIf: function stateExportsRejectIf(test, obj) {
      if (test(obj)) return self.Promise.reject();
      return obj;
    },
    export: function stateExportsExportData(name, buildData, state) {
      return R.pipePromise(buildData, R.rejectIf(R.equals(R.path(['exports', '_' + name], state)), 'unchanged'), function (data) {
        state.exports = R.assoc('_' + name, data, state.exports);
        return data;
      }, R.rejectIf(R.isNil, 'nil'), fileExportService.generate$('json'))(state).catch(function (error) {
        switch (error) {
          case 'nil':
            return null;
          case 'unchanged':
            return self.Promise.reject();
          default:
            {
              console.warn('Exports: error', name, error);
              return null;
            }
        }
      }).then(function (url) {
        state.exports = R.pipe(R.defaultTo({}), cleanupExport$([name]), R.assocPath([name], {
          name: 'clicknfeat_' + name + '.json',
          url: url
        }))(state.exports);
        console.warn('Exports', state.exports);
        state.changeEvent('Exports.' + name);
      }).catch(R.always(null));
    }
  };
  R.curryService(stateExportsService);
  return stateExportsService;
}]);
//# sourceMappingURL=exports.js.map
