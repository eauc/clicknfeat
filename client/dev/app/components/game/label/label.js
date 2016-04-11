'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameElementLabel', gameElementLabelDirectiveFactory);

  gameElementLabelDirectiveFactory.$inject = [];
  function gameElementLabelDirectiveFactory() {
    return {
      restrict: 'A',
      templateUrl: 'app/components/game/label/element_label.html',
      scope: {
        label: '=clickGameElementLabel'
      },
      link: link
    };

    function link() {
      console.log('gameElementLabel');
    }
  }
})();
//# sourceMappingURL=label.js.map
