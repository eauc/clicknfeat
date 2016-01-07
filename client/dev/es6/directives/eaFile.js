angular.module('clickApp.directives')
  .directive('eaFile', function() {
    return {
      restrict: 'A',
      scope: {
        eaFile: '&'
      },
      controller: [
        '$scope',
        () => {}
      ],
      link: function(scope, element) {
        element[0].onclick = function() {
          this.value = null;
        };
        element[0].onchange = function() {
          var files = element[0].files;
          scope.eaFile({ file: files });
          element[0].blur();
        };
      }
    };
  });
