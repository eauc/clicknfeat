(function() {
  angular.module('clickApp.directives')
    .directive('clickLogReplayList', logReplayListDirectiveFactory);

  logReplayListDirectiveFactory.$inject = [];
  function logReplayListDirectiveFactory() {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      const scroll_container = element[0];
      const list = scroll_container.getAttribute('click-log-replay-list');
      console.log('logReplayList', list);

      scope.$watch(list, () => {
        self.requestAnimationFrame(() => {
          scroll_container.scrollTop = 1000000;
        });
      });
    }
  }
})();
