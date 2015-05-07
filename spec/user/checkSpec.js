'use strict';

describe('user check', function() {

  beforeEach(function() {
    module('clickApp.services');
    module('clickApp.controllers');
  });

  describe('mainCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.userService = spyOnService('user');
        this.stateService = jasmine.createSpyObj('$state', ['go']);

        this.createController = function() {
          this.scope = $rootScope.$new();
          $controller('mainCtrl', { 
            '$scope': this.scope,
            '$state': this.stateService
          });
          $rootScope.$digest();
        };
      }
    ]));

    describe('checkUser()', function() {
      beforeEach(function() {
        this.createController();
      });

      when('no user is loaded', function() {
        this.scope.user = {};
      }, function() {
        it('should go to user login page', function() {
          this.scope.checkUser();

          expect(this.stateService.go)
            .toHaveBeenCalledWith('user');
        });
      });

      when('an user is loaded', function() {
        this.scope.user = {
          name: 'exemple'
        };
      }, function() {
        it('should not change page', function() {
          this.scope.checkUser();

          expect(this.stateService.go)
            .not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('loungeCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.createController = function() {
          this.scope = $rootScope.$new();
          this.scope.checkUser = jasmine.createSpy('checkUser');
          $controller('loungeCtrl', { 
            '$scope': this.scope
          });
          $rootScope.$digest();
        };
      }
    ]));

    when('page loads', function() {
      this.createController();
    }, function() {
      it('should check user is valid', function() {
        expect(this.scope.checkUser)
          .toHaveBeenCalled();
      });
    });
  });
});
