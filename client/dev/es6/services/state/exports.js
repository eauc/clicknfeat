angular.module('clickApp.services')
  .factory('stateExports', [
    'fileExport',
    function stateExportsServiceFactory(fileExportService) {
      let cleanupExport$ = R.curry((path, exports) => {
        return R.pipe(
          R.path([...path,'url']),
          fileExportService.cleanup,
          R.always(exports),
          R.assocPath([...path,'url'], null)
        )(exports);
      });
      let stateExportsService = {
        init: function stateExportsInit(state) {
          state.exports = {};
          return state;
        },
        rejectIf: function stateExportsRejectIf(test, obj) {
          if(test(obj)) return self.Promise.reject();
          return obj;
        },
        export: function stateExportsExportData(name, buildData, state) {
          return R.pipePromise(
            buildData,
            stateExportsService.rejectIf$(R.isNil),
            fileExportService.generate$('json')
          )(state)
            .catch(R.compose(R.always(null),
                             R.spyWarn('Export error', name)
                            )
                  )
            .then((url) => {
              state.exports = R.pipe(
                R.defaultTo({}),
                cleanupExport$([name]),
                R.assocPath([name], {
                  name: `clicknfeat_${name}.json`,
                  url: url
                })
              )(state.exports);
              console.warn('Exports', state.exports);
              state.changeEvent(`Exports.${name}`);
            });
        }
      };
      R.curryService(stateExportsService);
      return stateExportsService;
    }
  ]);
