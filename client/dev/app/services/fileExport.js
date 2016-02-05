'use strict';

(function () {
  angular.module('clickApp.services').factory('fileExport', fileExportServiceFactory);

  fileExportServiceFactory.$inject = ['jsonStringifier'];
  function fileExportServiceFactory(jsonStringifierService) {
    self.URL = self.URL || self.webkitURL;
    var stringifiers = {
      json: jsonStringifierService
    };

    var fileExportService = {
      generate: fileExportGenerate,
      cleanup: fileExportCleanup
    };
    R.curryService(fileExportService);
    return fileExportService;

    function fileExportGenerate(type, data) {
      return R.thread(data)(stringifiers[type].stringify, function (string) {
        return new self.Blob([string], { type: 'text/plain' });
      }, self.URL.createObjectURL)(data);
    }
    function fileExportCleanup(url) {
      if (!R.isNil(url)) {
        self.URL.revokeObjectURL(url);
      }
    }
  }
})();
//# sourceMappingURL=fileExport.js.map
