'use strict';

describe('user load', function() {
  describe('user service', function() {
    beforeEach(inject([ 'user', function(userService) {
      this.userService = userService;
      this.userConnectionService = spyOnService('userConnection');
    }]));

    when('load()', function() {
      this.ret = this.userService.load();
    }, function() {
      beforeEach(function() {
        this.localStorageService.load.resolveWith = 'localStorage.load.returnValue';
      });
      
      it('should read user data from local storage', function() {
        this.thenExpect(this.ret, function(user) {
          expect(this.localStorageService.load)
            .toHaveBeenCalledWith('clickApp.user');
        });
      });
      
      it('should create userConnection', function() {
        this.thenExpect(this.ret, function(user) {
          expect(this.userConnectionService.create)
            .toHaveBeenCalledWith({ state: 'localStorage.load.returnValue' });
          expect(user).toBe('userConnection.create.returnValue');
        });
      });
    });
  });
});
