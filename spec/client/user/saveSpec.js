'use strict';

describe('user load/store', function() {
  describe('user service', function() {
    beforeEach(inject([ 'user', function(userService) {
      this.userService = userService;
    }]));

    describe('save()', function() {
      it('should save user in local storage', function() {
        this.user = { name: 'exemple' };

        this.thenExpect(this.userService.save(this.user), function(user) {
          expect(this.localStorageService.save)
            .toHaveBeenCalledWith('clickApp.user', this.user);
          
          expect(user).toEqual('localStorage.save.returnValue');
        });

        this.localStorageService.save.resolve('localStorage.save.returnValue');
      });
    });
  });
});
