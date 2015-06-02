'use strict';

angular.module('clickApp.directives')
  .directive('clickGameBoard', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var preview = element[0].querySelector('#board-preview');
          var view = element[0].querySelector('#board-view');
          console.log('gameBoard', element, preview, view);
          scope.onGameEvent('changeBoard', function onChangeBoard() {
            var preview_link = R.defaultTo('', R.path(['game', 'board', 'preview'], scope));
            var view_link = R.defaultTo('', R.path(['game', 'board', 'img'], scope));
            $window.requestAnimationFrame(function setBoardPreview() {
              preview.setAttribute('xlink:href', preview_link);
              view.setAttribute('xlink:href', view_link);
            });
          }, scope);
        }
      };
    }
  ]);
