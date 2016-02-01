angular.module('clickApp.services')
  .factory('fileImport', [
    'jsonParser',
    function fileImportServiceFactory(jsonParserService) {
      var parsers = {
        'json': jsonParserService
      };
      var fileImportService = {
        read: function fileImportRead(type, file) {
          return new self.Promise((resolve, reject) => {
            var reader = new self.FileReader();
            reader.onload = (e) => {
              parsers[type]
                .parse(e.target.result)
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
      };
      R.curryService(fileImportService);
      return fileImportService;
    }
  ]);
