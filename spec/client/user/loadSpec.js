'use strict';

describe('user load', function() {
  describe('user service', function() {
    beforeEach(inject([ 'user', function(userService) {
      this.userService = userService;
    }]));

    describe('load()', function() {
      it('should read user data from local storage', function() {
        this.thenExpect(this.userService.load(), function(user) {
          expect(this.localStorageService.load)
            .toHaveBeenCalledWith('clickApp.user');
          expect(user).toBe('localStorage.load.returnValue');
        });

        this.localStorageService.load.resolve('localStorage.load.returnValue');
      });
    });
  });
});
