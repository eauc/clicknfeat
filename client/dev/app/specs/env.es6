beforeEach(function() {
  spyOn(console, 'log');

  if(R.isNil(self.requestAnimationFrame)) {
    self.requestAnimationFrame = function() {};
  }
  spyOn(self, 'requestAnimationFrame')
    .and.callFake((fn) => {
      fn();
    });

  module('clickApp.services');
  module('clickApp.models');
});
