angular.module('clickApp.services')
  .factory('fileExport', [
    'jsonStringifier',
    function fileExportServiceFactory(jsonStringifierService) {
      self.URL = self.URL || self.webkitURL;
      var stringifiers = {
        json: jsonStringifierService
      };
      var fileExportService = {
        generate: function fileExportGenerate(type, data) {
          return R.pipeP(
            stringifiers[type].stringify,
            (string) => {
              return new self.Blob([string], {type: 'text/plain'});
            },
            self.URL.createObjectURL
          )(data);
        },
        cleanup: function fileExportCleanup(url) {
          if(!R.isNil(url)) {
            self.URL.revokeObjectURL(url);
          }
        }
      };
      R.curryService(fileExportService);
      return fileExportService;
    }
  ]);
