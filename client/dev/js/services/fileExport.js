'use strict';

angular.module('clickApp.services').factory('fileExport', ['jsonStringifier', function fileExportServiceFactory(jsonStringifierService) {
  self.URL = self.URL || self.webkitURL;
  var stringifiers = {
    json: jsonStringifierService
  };
  var fileExportService = {
    generate: function generate(type, data) {
      return R.pipeP(stringifiers[type].stringify, function (string) {
        return new self.Blob([string], { type: 'text/plain' });
      }, self.URL.createObjectURL)(data);
    },
    cleanup: function cleanup(url) {
      if (!R.isNil(url)) {
        self.URL.revokeObjectURL(url);
      }
    }
  };
  R.curryService(fileExportService);
  return fileExportService;
}]);
//# sourceMappingURL=fileExport.js.map
