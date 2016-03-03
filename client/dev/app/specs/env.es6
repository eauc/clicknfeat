beforeEach(function() {
  spyOn(console, 'log');

  if(R.isNil(self.requestAnimationFrame)) {
    self.requestAnimationFrame = function() {};
  }
  spyOn(self, 'requestAnimationFrame')
    .and.callFake((fn) => {
      fn();
    });

  this.promptService = jasmine.createSpyObj('prompt', [
    'promptP'
  ]);
  spyReturnPromise(this.promptService.promptP);
  this.promptService.promptP
    .resolveWith('prompt.promptP.returnValue');
  module({
    'prompt': this.promptService
  });

  module('clickApp.services');
  module('clickApp.models');
});
