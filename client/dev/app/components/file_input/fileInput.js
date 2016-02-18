'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickFile', clickFileDirectiveFactory);

  clickFileDirectiveFactory.$inject = [];
  function clickFileDirectiveFactory() {
    return {
      restrict: 'A',
      scope: {
        clickFile: '&'
      },
      link: link
    };
    function link(scope, element) {
      var input = element[0];

      input.setAttribute('multiple', '');
      input.onclick = onClick;
      input.onchange = onChange;

      return;

      function onClick() {
        this.value = null;
      }
      function onChange() {
        var files = input.files;
        scope.clickFile({ file: files });
        input.blur();
      }
    }
  }
})();
//# sourceMappingURL=fileInput.js.map
