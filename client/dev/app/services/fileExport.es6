(function() {
  angular.module('clickApp.services')
    .factory('fileExport', fileExportServiceFactory);

  fileExportServiceFactory.$inject = [
    'jsonStringifier',
  ];
  function fileExportServiceFactory(jsonStringifierService) {
    self.URL = self.URL || self.webkitURL;
    const stringifiers = {
      json: jsonStringifierService
    };

    const fileExportService = {
      generate: fileExportGenerate,
      cleanup: fileExportCleanup
    };
    R.curryService(fileExportService);
    return fileExportService;

    function fileExportGenerate(type, data) {
      return R.thread(data)(
        stringifiers[type].stringify,
        (string) => {
          return new self.Blob([string], {type: 'text/plain'});
        },
        self.URL.createObjectURL
      );
    }
    function fileExportCleanup(url) {
      if(!R.isNil(url)) {
        self.URL.revokeObjectURL(url);
      }
    }
  }
})();
