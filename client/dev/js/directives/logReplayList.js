'use strict';

angular.module('clickApp.directives').directive('clickLogReplayList', [function () {
  return {
    restrict: 'A',
    link: function link(scope, element) {
      var list = element[0].getAttribute('click-log-replay-list');
      console.log('logReplayList', list);
      scope.$watch(list, function () {
        self.requestAnimationFrame(function () {
          element[0].scrollTop = 1000000;
        });
      });
    }
  };
}]);
//# sourceMappingURL=logReplayList.js.map
