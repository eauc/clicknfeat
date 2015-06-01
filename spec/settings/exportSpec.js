'use strict';

describe('export settings', function() {
  describe('settingsMainCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.fileExportService = spyOnService('fileExport');

        this.createController = function(params) {
          this.scope = $rootScope.$new();
          this.scope.settings = {
            current : 'current'
          };
          
          $controller('settingsMainCtrl', { 
            '$scope': this.scope,
          });
          $rootScope.$digest();
        };
      }
    ]));

    when('page loads', function() {
      this.createController();
    }, function() {
      it('should export current settings as JSON file', function() {
        expect(this.fileExportService.generate)
          .toHaveBeenCalledWith('json', 'current');
        expect(this.scope.save)
          .toEqual({
            name: 'clicknfeat_settings.json',
            url: 'fileExport.generate.returnValue'
          });
      });
    });
  });
});
