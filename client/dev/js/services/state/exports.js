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
      return R.pipePromise(buildData, stateExportsService.rejectIf$(R.isNil), fileExportService.generate$('json'))(state).catch(R.compose(R.always(null), R.spyWarn('Export error', name))).then(function (url) {
        state.exports = R.pipe(R.defaultTo({}), cleanupExport$([name]), R.assocPath([name], {
          name: 'clicknfeat_' + name + '.json',
          url: url
        }))(state.exports);
        console.warn('Exports', state.exports);
        state.changeEvent('Exports.' + name);
      });
    }
  };
  R.curryService(stateExportsService);
  return stateExportsService;
}]);
//# sourceMappingURL=exports.js.map
