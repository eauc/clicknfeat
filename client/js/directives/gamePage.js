'use strict';

angular.module('clickApp.directives')
  .directive('clickGamePage', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var gameview = element[0].querySelector('#gameview');
          var menu = element[0].querySelector('#menu');

          var toggleMenuClick = (function() {
            var menu_hidden = false;
            var gameview_width_mem;
            return function toggleMenuClick(event) {
              if(!menu_hidden) {
                var rect = gameview.getBoundingClientRect();
                gameview_width_mem = rect.width;
                gameview.style.width = $window.innerWidth+'px';
              }
              else {
                gameview.style.width = gameview_width_mem+'px';
              }
              gameview.classList.toggle('resizable');
              menu.classList.toggle('hidden');
              menu_hidden = !menu_hidden;
            };
          })();

          element[0]
            .querySelector('#menu-toggle')
            .addEventListener('click', toggleMenuClick);
          scope.$on('toggleMenu', toggleMenuClick);

          var rect = gameview.getBoundingClientRect();
          gameview.style.width = (rect.height)+'px';
        }
      };
    }
  ]);
