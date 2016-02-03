'use strict';

beforeEach(function () {
  spyOn(console, 'log');

  if (R.isNil(self.requestAnimationFrame)) {
    self.requestAnimationFrame = function () {};
  }
  spyOn(self, 'requestAnimationFrame').and.callFake(function (fn) {
    fn();
  });

  module('clickApp.services');
  module('clickApp.models');
});
//# sourceMappingURL=env.js.map
