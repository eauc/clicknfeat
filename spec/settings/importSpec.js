'use strict';

describe('import settings', function() {
  describe('settingsMainCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.fileExportService = spyOnService('fileExport');
        this.fileImportService = spyOnService('fileImport');
        mockReturnPromise(this.fileImportService.read);

        this.createController = function(params) {
          this.scope = $rootScope.$new();
          this.scope.settings = {
            current : 'current'
          };
          this.scope.doResetSettings = jasmine.createSpy('doResetSettings');
          this.scope.deferDigest = jasmine.createSpy('deferDigest');
          
          $controller('settingsMainCtrl', { 
            '$scope': this.scope,
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    describe('when user imports settings file', function() {
      beforeEach(function() {
        this.scope.doOpenSettingsFile(['file']);
      }, function() {
        it('should read the JSON file', function() {
          expect(this.fileImportService.read)
            .toHaveBeenCalledWith('json', 'file');
        });

        describe('when file read ok', function() {
          beforeEach(function() {
            this.fileImportService.read.resolve('data');
          }, function() {
            it('should update current settings with data', function() {
              expect(this.scope.doResetSettings)
                .toHaveBeenCalledWith('data');
            });

            it('should display load message', function() {
              expect(this.scope.open_result)
                .toEqual(['Settings loaded']);
              expect(this.scope.deferDigest)
                .toHaveBeenCalledWith(this.scope);
            });
          });
        });

        describe('when file read fails', function() {
          beforeEach(function() {
            this.fileImportService.read.reject(['error']);
          }, function() {
            it('should display error message', function() {
              expect(this.scope.open_result)
                .toEqual(['error']);
              expect(this.scope.deferDigest)
                .toHaveBeenCalledWith(this.scope);
            });
          });
        });
      });
    });
  });
});
