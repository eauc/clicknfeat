'use strict';

describe('user login', function() {

  beforeEach(function() {
    module('clickApp.controllers');
    module('clickApp.services');

    this.localStorage = jasmine.createSpyObj('localStorage', [
      'setItem',
      'getItem'
    ]);
    module({
      'localStorage': this.localStorage,
    });
  });

  describe('mainCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.userService = spyOnService('user');

        this.createController = function(user) {
          this.scope = $rootScope.$new();

          $controller('mainCtrl', { 
            '$scope': this.scope,
            '$state': this.stateService
          });
          $rootScope.$digest();
        };
      }
    ]));

    describe('setUser(<new_user>)', function() {
      beforeEach(function() {
        this.createController();

        this.scope.setUser({ name: 'new_user' });
      });

      it('should update current user', function() {
        expect(this.scope.user)
          .toEqual({ name: 'new_user' });
      });

      it('should store new user', function() {
        expect(this.userService.store)
          .toHaveBeenCalledWith({ name: 'new_user' });
      });
    });
  });

  describe('userCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.userService = spyOnService('user');
        this.stateService = jasmine.createSpyObj('$state', ['go']);

        this.createController = function(user) {
          this.scope = $rootScope.$new();
          this.scope.user = R.defaultTo({}, user);

          $controller('userCtrl', { 
            '$scope': this.scope,
            '$state': this.stateService
          });
          $rootScope.$digest();
        };
      }
    ]));

    when('page loads', function() {
      this.createController({ name: 'exemple' });
    }, function() {
      it('should create an edit copy of current user', function() {
        expect(this.scope.edit_user)
          .toEqual(this.scope.user);
        expect(this.scope.edit_user)
          .not.toBe(this.scope.user);
      });
    });

    when('user logs offline', function() {
      this.scope.doPlayOffline();
    }, function() {
      beforeEach(function() {
        this.createController();
        this.scope.setUser = jasmine.createSpy('setUser');

        this.scope.edit_user = {
          name: 'new_user'
        };
      });

      it('should update current user', function() {
        expect(this.scope.setUser)
          .toHaveBeenCalledWith(this.scope.edit_user);
      });

      it('should go to lounge page', function() {
        expect(this.stateService.go)
          .toHaveBeenCalledWith('lounge');
      });
    });
  });
});
