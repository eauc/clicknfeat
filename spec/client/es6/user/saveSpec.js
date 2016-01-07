describe('user load/store', function() {
  describe('user service', function() {
    beforeEach(inject([ 'user', function(userService) {
      this.userService = userService;
    }]));

    when('save()', function() {
      this.ret = this.userService.save(this.user);
    }, function() {
      beforeEach(function() {
        this.user = { state: { name: 'exemple' },
                      connection: 'connection'
                    };
        this.localStorageService.save
          .resolveWith = 'localStorage.save.returnValue';
      });
      
      it('should save user in local storage', function() {
        this.thenExpect(this.ret, function(user) {
          expect(this.localStorageService.save)
            .toHaveBeenCalledWith('clickApp.user', this.user.state);
          
          expect(user).toEqual(this.user);
        });
      });
    });
  });
});
