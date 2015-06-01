'use strict';

self.fileExportServiceFactory = function fileExportServiceFactory(jsonStringifierService) {
  self.URL = self.URL || self.webkitURL;
  var stringifiers = {
    json: jsonStringifierService
  };
  var fileExportService = {
    generate: function(type, data) {
      return R.pipe(
        stringifiers[type].stringify,
        function(string) {
          return new self.Blob([string], {type: 'text/plain'});
        },
        self.URL.createObjectURL
      )(data);
    },
    cleanup: function(url) {
      if(!R.isNil(url)) {
        self.URL.revokeObjectURL(url);
      }
    }
  };
  R.curryService(fileExportService);
  return fileExportService;
};
