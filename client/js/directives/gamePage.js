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
            var gameview_width_mem;
            return function toggleMenuClick(event) {
              var menu_hidden = menu.classList.contains('hidden');
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
            };
          })();

          element[0]
            .querySelector('#menu-toggle')
            .addEventListener('click', toggleMenuClick);
          scope.onGameEvent('toggleMenu', toggleMenuClick, scope);

          var rect = gameview.getBoundingClientRect();
          gameview.style.width = (rect.height)+'px';
        }
      };
    }
  ]);
