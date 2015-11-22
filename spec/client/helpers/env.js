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

  this.thenExpect = it.thenExpect;
  this.thenExpectError = it.thenExpectError;
  
  module('clickApp.services');
  module('clickApp.controllers');
  this.promptService = jasmine.createSpyObj('prompt', [
    'prompt'
  ]);
  mockReturnPromise(this.promptService.prompt);
  module({
    'prompt': this.promptService,
  });

  this.localStorageService = spyOnService('localStorage');
  mockReturnPromise(this.localStorageService.getItem);
  mockReturnPromise(this.localStorageService.setItem);
  mockReturnPromise(this.localStorageService.removeItem);
  mockReturnPromise(this.localStorageService.load);
  mockReturnPromise(this.localStorageService.save);
  this.jsonStringifierService = spyOnService('jsonStringifier');
  mockReturnPromise(this.jsonStringifierService.stringify);
});
