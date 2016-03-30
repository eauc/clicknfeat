'use strict';

(function () {
  angular.module('clickApp.services').factory('fileImport', fileImportServiceFactory);

  fileImportServiceFactory.$inject = ['jsonParser'];
  function fileImportServiceFactory(jsonParserService) {
    var parsers = {
      json: jsonParserService
    };

    var fileImportService = {
      readP: fileImportReadP
    };
    R.curryService(fileImportService);
    return fileImportService;

    function fileImportReadP(type, file) {
      return new self.Promise(function (resolve, reject) {
        var reader = new self.FileReader();
        reader.onload = function (e) {
          parsers[type].parseP(e.target.result).then(resolve).catch(reject);
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
  }
})();
//# sourceMappingURL=fileImport.js.map
