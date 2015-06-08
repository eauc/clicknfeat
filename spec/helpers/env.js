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
  this.promptService = jasmine.createSpyObj('prompt', [
    'prompt'
  ]);
  module({
    http: this.httpService,
    'localStorage': this.localStorage,
    'prompt': this.promptService,
  });
  mockReturnPromise(this.httpService.get);
  mockReturnPromise(this.promptService.prompt);

  this.jsonParserService = spyOnService('jsonParser');
  mockReturnPromise(this.jsonParserService.parse);
});
