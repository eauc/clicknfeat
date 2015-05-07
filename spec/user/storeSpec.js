'use strict';

describe('user load/store', function() {

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

    when('page loads', function() {
      this.createController();
    }, function() {
      it('should load user', function() {
        expect(this.userService.load)
          .toHaveBeenCalled();
        expect(this.scope.user)
          .toBe('user.load.returnValue');
      });
    });
  });

  describe('user service', function() {
    beforeEach(inject([ 'user', function(userService) {
      this.userService = userService;
    }]));

    describe('store()', function() {
      it('should store user in local storage', function() {
        this.user = { name: 'exemple' };

        this.userService.store(this.user);

        expect(this.localStorage.setItem)
          .toHaveBeenCalledWith('clickApp.user',
                                '{"name":"exemple"}');
      });
    });

    describe('load()', function() {
      it('should read user data from local storage', function() {
        this.userService.load();

        expect(this.localStorage.getItem)
          .toHaveBeenCalledWith('clickApp.user');
      });

      using([
        [ 'data'    ],
        [ null      ],
        [ ''        ],
        [ 'invalid' ],
      ], function(e, d) {
        when('data is invalid, '+d, function() {
          this.localStorage.getItem.and.returnValue(e.data);
        }, function() {
          it('should return empty object', function() {
            expect(this.userService.load())
              .toEqual({});
          });
        });
      });

      when('data is valid', function() {
        this.localStorage.getItem.and.returnValue('{"value":"sample"}');
      }, function() {
        it('should return parsed data', function() {
          expect(this.userService.load())
            .toEqual({ value: 'sample' });
        });
      });
    });
  });
});
