'use strict';

describe('state', function() {

  beforeEach(function() {
    module('clickApp.controllers');
    module('clickApp.services');
  });

  describe('mainCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.stateService = jasmine.createSpyObj('$state', [
          'is',
          'go'
        ]);
        this.stateService.is.and.returnValue('state.is.returnValue');

        this.createController = function(user) {
          this.scope = $rootScope.$new();
          $controller('mainCtrl', { 
            '$scope': this.scope,
            '$state': this.stateService,
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    describe('stateIs(<name>)', function() {
      it('should proxy stateService', function() {
        expect(this.scope.stateIs('name'))
          .toBe('state.is.returnValue');
        expect(this.stateService.is)
          .toHaveBeenCalledWith('name');
      });
    });

    describe('goToState(<name>)', function() {
      it('should proxy stateService', function() {
        this.scope.goToState('name');
        expect(this.stateService.go)
          .toHaveBeenCalledWith('name');
      });
    });

    describe('currentState()', function() {
      it('should proxy stateService.current', function() {
        this.stateService.current = { name: 'current' };
        expect(this.scope.currentState())
          .toBe(this.stateService.current);
      });
    });
  });
});
