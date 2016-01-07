'use strict';

angular.module('clickApp.services').factory('fileImport', ['jsonParser', function fileImportServiceFactory(jsonParserService) {
  var parsers = {
    'json': jsonParserService
  };
  var fileImportService = {
    read: function fileImportRead(type, file) {
      return new self.Promise(function (resolve, reject) {
        var reader = new self.FileReader();
        reader.onload = function (e) {
          parsers[type].parse(e.target.result).then(resolve).catch(reject);
        };
        reader.onerror = function () {
          reject(['Error reading file']);
        };
        reader.onabort = function () {
          reject(['Abort reading file']);
        };
        reader.readAsText(file);
      });
    }
  };
  R.curryService(fileImportService);
  return fileImportService;
}]);
//# sourceMappingURL=fileImport.js.map
