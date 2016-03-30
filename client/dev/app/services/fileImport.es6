(function() {
  angular.module('clickApp.services')
    .factory('fileImport', fileImportServiceFactory);

  fileImportServiceFactory.$inject = [
    'jsonParser',
  ];
  function fileImportServiceFactory(jsonParserService) {
    const parsers = {
      json: jsonParserService
    };

    const fileImportService = {
      readP: fileImportReadP
    };
    R.curryService(fileImportService);
    return fileImportService;

    function fileImportReadP(type, file) {
      return new self.Promise((resolve, reject) => {
        var reader = new self.FileReader();
        reader.onload = (e) => {
          parsers[type]
            .parseP(e.target.result)
            .then(resolve)
            .catch(reject);
        };
        reader.onerror = () => {
          reject(['Error reading file']);
        };
        reader.onabort = () => {
          reject(['Abort reading file']);
        };
        reader.readAsText(file);
      });
    }
  }
})();
