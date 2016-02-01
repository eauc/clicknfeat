'use strict';

angular.module('clickApp.directives').directive('eaFile', function () {
  return {
    restrict: 'A',
    scope: {
      eaFile: '&'
    },
    controller: ['$scope', function () {}],
    link: function link(scope, element) {
      element[0].onclick = function () {
        this.value = null;
      };
      element[0].onchange = function () {
        var files = element[0].files;
        scope.eaFile({ file: files });
        element[0].blur();
      };
    }
  };
});
//# sourceMappingURL=fileInput.js.map
