'use strict';

angular.module('clickApp.directives')
  .directive('eaFile', function() {
    return {
      restrict: 'A',
      scope: {
        eaFile: '&',
      },
      controller: [
        '$scope',
        function($scope) {
        }
      ],
      link: function(scope, element, attrs) {
        element[0].onchange = function() {
          // console.log('ea-file', element, element[0].files[0]);
          var files = element[0].files;
          scope.eaFile({ file: files });
        };
      }
    };
  });
