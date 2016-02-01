angular.module('clickApp.directives')
  .directive('clickLogReplayList', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, element) {
          var list = element[0].getAttribute('click-log-replay-list');
          console.log('logReplayList', list);
          scope.$watch(list, () => {
            self.requestAnimationFrame(() => {
              element[0].scrollTop = 1000000;
            });
          });
        }
      };
    }
  ]);
