'use strict';

beforeEach(function() {
  spyOn(console, 'log');

  if(R.isNil(self.requestAnimationFrame)) {
    self.requestAnimationFrame = function() {};
  }
  spyOn(self, 'requestAnimationFrame')
    .and.callFake(function(fn) {
      fn();
    });

  module('clickApp.services');
  module('clickApp.controllers');
  this.httpService = jasmine.createSpyObj('http', [
    'get', 'post', 'put', 'delete'
  ]);
  this.localStorage = jasmine.createSpyObj('localStorage', [
    'setItem', 'getItem'
  ]);
  module({
    http: this.httpService,
    'localStorage': this.localStorage,
  });
  mockReturnPromise(this.httpService.get);
});
