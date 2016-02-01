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
            R.rejectIf(R.equals(R.path(['exports',`_${name}`], state)),
                       'unchanged'),
            (data) => {
              state.exports = R.assoc(`_${name}`, data, state.exports);
              return data;
            },
            R.rejectIf(R.isNil, 'nil'),
            fileExportService.generate$('json')
          )(state)
            .catch((error) => {
              switch(error) {
              case 'nil': return null;
              case 'unchanged': return self.Promise.reject();
              default: {
                console.warn('Exports: error', name, error);
                return null;
              }
              }
            })
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
            })
            .catch(R.always(null));
        }
      };
      R.curryService(stateExportsService);
      return stateExportsService;
    }
  ]);
