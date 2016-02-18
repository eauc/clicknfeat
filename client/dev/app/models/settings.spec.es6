describe('settings model', function() {
  beforeEach(inject([
    'settings',
    function(settingsModel) {
      this.settingsModel = settingsModel;

      this.default_settings = {
        Bindings: {
          test1: { binding1: 'a1',
                   binding2: 'a2' },
          test2: { binding1: 'b1' }
        }
      };
      this.test1_updater = jasmine.createSpy('test1_updater');
      this.settingsModel.register('Bindings', 'test1',
                                  this.default_settings.Bindings.test1,
                                  this.test1_updater);
      this.test2_updater = jasmine.createSpy('test2_updater');
      this.settingsModel.register('Bindings', 'test2',
                                  this.default_settings.Bindings.test2,
                                  this.test2_updater);

      this.localStorageService = spyOnService('localStorage');
      this.localStorageService.loadP.resolveWith({});
    }
  ]));

  context('init()', function() {
    return this.settingsModel.initP();
  }, function() {
    it('should load settings from local storage', function() {
      expect(this.localStorageService.loadP)
        .toHaveBeenCalledWith('clickApp.settings');
    });

    context('when load fails', function() {
      this.localStorageService.loadP
        .rejectWith('reason');
    }, function() {
      it('should return default object', function() {
        expect(this.context.default)
          .toEqual(this.default_settings);

        expect(this.context.current)
          .toEqual({
            Bindings: {
              test1: {  },
              test2: {  }
            }
          });

        expect(Object.getPrototypeOf(this.context.current.Bindings.test1))
          .toEqual(this.default_settings.Bindings.test1);
        expect(Object.getPrototypeOf(this.context.current.Bindings.test2))
          .toEqual(this.default_settings.Bindings.test2);
      });
    });

    context('when load succeeds', function() {
      this.localStorageService.loadP.resolveWith({
        Bindings: {
          test1: { binding1: 'a',
                   binding3: 'd' },
          test3: { binding2: 'c' }
        }
      });
    }, function() {
      it('should update modified settings', function() {
        expect(this.test1_updater)
          .toHaveBeenCalledWith({ binding1: 'a',
                                  binding3: 'd' });
        expect(this.test2_updater)
          .toHaveBeenCalledWith({});
      });

      it('should return settings object', function() {
        expect(this.context.default)
          .toEqual(this.default_settings);

        expect(this.context.current)
          .toEqual({
            Bindings: {
              test1: { binding1: 'a',
                       binding3: 'd' },
              test2: {  }
            }
          });

        expect(Object.getPrototypeOf(this.context.current.Bindings.test1))
          .toEqual(this.default_settings.Bindings.test1);
        expect(Object.getPrototypeOf(this.context.current.Bindings.test2))
          .toEqual(this.default_settings.Bindings.test2);
      });
    });
  });

  context('bind(<data>)', function() {
      return this.settingsModel.bind(this.data);
  }, function() {
    beforeEach(function() {
      this.data = {
        Bindings: {
          test1: { binding1: 'a',
                   binding3: 'd' },
          test3: { binding2: 'c' }
        }
      };
    });

    it('should return settings object', function() {
      expect(this.context.default)
        .toEqual(this.default_settings);

      expect(this.context.current)
        .toEqual({
          Bindings: {
            test1: { binding1: 'a',
                     binding3: 'd' },
            test2: {  }
          }
        });

      expect(Object.getPrototypeOf(this.context.current.Bindings.test1))
        .toEqual(this.default_settings.Bindings.test1);
      expect(Object.getPrototypeOf(this.context.current.Bindings.test2))
        .toEqual(this.default_settings.Bindings.test2);
    });
  });

  context('update(<settings>)', function() {
      return this.settingsModel.update(this.settings);
  }, function() {
    beforeEach(function() {
      this.data = {
        Bindings: {
          test1: { binding1: 'a',
                   binding3: 'd' },
          test3: { binding2: 'c' }
        }
      };
      this.settings = this.settingsModel.bind(this.data);
    });

    it('should update modified settings', function() {
      expect(this.test1_updater)
        .toHaveBeenCalledWith({ binding1: 'a',
                                binding3: 'd' });
      expect(this.test2_updater)
        .toHaveBeenCalledWith({});
    });

    it('should return settings object', function() {
      expect(this.context)
        .toBe(this.settings);
    });
  });
});
