'use strict';

angular.module('clickApp.directives').directive('clickGamePage', ['$window', function ($window) {
  return {
    restrict: 'A',
    link: function link(scope, element /*, attrs*/) {
      var toggleMenuClick = (function () {
        var gameview_width_mem = undefined;
        return function () {
          var gameview = element[0].querySelector('#gameview');
          var menu = element[0].querySelector('#menu');
          var dice_osd = element[0].querySelector('#dice-osd');
          var chat_osd = element[0].querySelector('#chat-osd');

          var menu_hidden = menu.classList.contains('hidden');
          if (!menu_hidden) {
            var _rect = gameview.getBoundingClientRect();
            gameview_width_mem = _rect.width;
            gameview.style.width = $window.innerWidth + 'px';
          } else {
            gameview.style.width = gameview_width_mem + 'px';
          }
          gameview.classList.toggle('resizable');
          menu.classList.toggle('hidden');
          dice_osd.classList.toggle('show');
          chat_osd.classList.toggle('show');
        };
      })();

      element[0].querySelector('#menu-toggle').addEventListener('click', toggleMenuClick);
      scope.onGameEvent('toggleMenu', toggleMenuClick, scope);

      var gameview = element[0].querySelector('#gameview');
      var rect = gameview.getBoundingClientRect();
      gameview.style.width = rect.height + 'px';
    }
  };
}]);
//# sourceMappingURL=gamePage.js.map
