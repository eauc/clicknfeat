'use strict';

self.fileImportServiceFactory = function fileImportServiceFactory(jsonParserService) {
  var parsers = {
    'json': jsonParserService
  };
  var fileImportService = {
    read: function(type, file) {
      return new self.Promise(function(resolve, reject) {
        var reader = new self.FileReader();
        reader.onload = function(e) {
          parsers[type].parse(e.target.result)
            .then(resolve)
            .catch(reject);
        };
        reader.onerror = function(e) {
          reject(['Error reading file']);
        };
        reader.onabort = function(e) {
          reject(['Abort reading file']);
        };
        reader.readAsText(file);
      });
    }
  };
  R.curryService(fileImportService);
  return fileImportService;
};
