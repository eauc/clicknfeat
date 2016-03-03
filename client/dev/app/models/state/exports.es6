(function() {
  angular.module('clickApp.services')
    .factory('stateExports', stateExportsServiceFactory);

  stateExportsServiceFactory.$inject = [
    'fileExport',
  ];
  function stateExportsServiceFactory(fileExportService) {
    const stateExportsService = {
      create: stateExportsCreate,
      exportP: stateExportsExportDataP
    };

    const cleanupExport$ = R.curry(cleanupExport);

    R.curryService(stateExportsService);
    return stateExportsService;

    function stateExportsCreate(state) {
      state.exports = {};
      return state;
    }
    function stateExportsExportDataP(name, buildData, state) {
      return R.thread(state)(
        generateDataUrlP,
        R.condErrorP([
          [ R.equals('nil'), R.always(null) ],
          [ R.equals('unchanged'), R.rejectP ],
          [ R.T, (error) => {
            console.warn('Exports: error', name, error);
            return null;
          } ]
        ]),
        updateExportsP,
        R.condErrorP([
          [ R.T, R.always(null) ]
        ])
      );

      function generateDataUrlP(state) {
        return R.threadP(state)(
          buildData,
          R.rejectIf(dataUnchanged, 'unchanged'),
          memoizeData,
          R.rejectIf(R.isNil, 'nil'),
          fileExportService.generate$('json')
        );
      }
      function dataUnchanged(data) {
        return R.equals(R.path(['exports',`_${name}`], state), data);
      }
      function memoizeData(data) {
        state.exports = R.assoc(`_${name}`, data, state.exports);
        return data;
      }
      function updateExportsP(url) {
        return R.threadP(url)(
          updateExports,
          emitExportsEvent
        );
      }
      function updateExports(url) {
        state.exports = R.thread(state.exports)(
          R.defaultTo({}),
          cleanupExport$([name]),
          R.assocPath([name], {
            name: `clicknfeat_${name}.json`,
            url: url
          })
        );
      }
      function emitExportsEvent() {
        console.warn('Exports', state.exports);
        state.queueChangeEventP(`Exports.${name}`);
      }
    }
    function cleanupExport(path, exports) {
      return R.thread(exports)(
        R.path([ ...path, 'url' ]),
        fileExportService.cleanup,
        R.always(exports),
        R.assocPath([ ...path, 'url' ], null)
      );
    }
  }
})();
